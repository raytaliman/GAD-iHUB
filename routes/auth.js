import { Router } from 'express';
import crypto from 'crypto';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Session configuration
export const SESSION_COOKIE_NAME = 'csf_session';
export const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_SECRET = process.env.SESSION_SECRET || 'dost1-ihub-gad-super-session-secret-key-2026';

// Database connection pool for user authentication & verification
const pool = new pg.Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'ihubGAD',
});

// Auto-ensure microsoft_id column exists on users table
let dbReady = false;
async function ensureDbColumns() {
  try {
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS microsoft_id VARCHAR(255);
    `);
    dbReady = true;
  } catch (err) {
    // Non-fatal if table doesn't exist yet or connection is queued
    console.warn('[Auth DB] Note: users table check/alter skipped:', err.message);
  }
}
ensureDbColumns();

export function getCookieOptions(req) {
  let secure = Boolean(req.secure || req.headers['x-forwarded-proto'] === 'https');
  if (process.env.COOKIE_SECURE === 'true') secure = true;
  if (process.env.COOKIE_SECURE === 'false') secure = false;

  return {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: TOKEN_TTL_MS,
    path: '/',
  };
}

export function createSessionToken(user) {
  const payload = Buffer.from(
    JSON.stringify({
      userId: user.id,
      email: user.email,
      fullName: user.fullName || user.full_name || user.username || user.email,
      userLevel: user.userLevel || user.user_level || 'admin',
      exp: Date.now() + TOKEN_TTL_MS,
    }),
    'utf8'
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function decodeTokenPayload(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payload, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  const sigBuf = Buffer.from(sig, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');

  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof decoded.exp !== 'number' || decoded.exp <= Date.now()) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export function extractSessionToken(req) {
  const cookieHeader = req.headers.cookie || '';
  if (cookieHeader) {
    const pairs = cookieHeader.split(';');
    for (const pair of pairs) {
      const idx = pair.indexOf('=');
      if (idx === -1) continue;
      const name = pair.slice(0, idx).trim();
      if (name === SESSION_COOKIE_NAME || name === 'dost1_session') {
        return decodeURIComponent(pair.slice(idx + 1).trim());
      }
    }
  }

  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return '';
}

export function getMicrosoftConfig() {
  return {
    tenantId: process.env.MICROSOFT_TENANT_ID || '',
    clientId: process.env.MICROSOFT_CLIENT_ID || '',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
    redirectUri:
      process.env.MICROSOFT_REDIRECT_URI ||
      `http://localhost:${process.env.PORT || '3003'}/api/auth/microsoft/callback`,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  };
}

// Helper to find authorized user from PostgREST or direct PostgreSQL pool
async function findUserInDatabase(msId, email) {
  const normalizedEmail = String(email || '').toLowerCase().trim();

  // 1. Query PostgREST (port 3001) as used by the live application
  try {
    const postgrestUrl = `http://127.0.0.1:3001/users?or=(microsoft_id.eq.${encodeURIComponent(msId)},email.ilike.${encodeURIComponent(normalizedEmail)})`;
    const res = await fetch(postgrestUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });
    if (res.ok) {
      const users = await res.json();
      if (Array.isArray(users) && users.length > 0) {
        return users[0];
      }
    }
  } catch (err) {
    console.warn('[Auth] PostgREST query failed, trying direct pool:', err.message);
  }

  // 2. Query direct pg pool
  try {
    const { rows } = await pool.query(
      'SELECT id, username, email, is_active, user_level, microsoft_id FROM users WHERE microsoft_id = $1 OR LOWER(email) = $2',
      [msId, normalizedEmail]
    );
    if (rows && rows.length > 0) {
      return rows[0];
    }
  } catch (err) {
    console.warn('[Auth] Direct pool query failed:', err.message);
  }

  return null;
}

// Helper to link microsoft_id to existing user account
async function linkMicrosoftId(userId, msId) {
  try {
    await fetch(`http://127.0.0.1:3001/users?id=eq.${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ microsoft_id: msId }),
    });
  } catch (_) {}

  try {
    await pool.query('UPDATE users SET microsoft_id = $1 WHERE id = $2', [msId, userId]);
  } catch (_) {}
}

// GET /api/auth/microsoft - Initiate Microsoft OAuth login (same pattern as DOST ID System)
router.get('/microsoft', (req, res) => {
  const { tenantId, clientId, redirectUri } = getMicrosoftConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    response_mode: 'query',
    scope: 'openid profile email User.Read',
    prompt: 'select_account',
  });

  const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
  if (req.query.format === 'json') {
    return res.json({ url: authUrl });
  }
  return res.redirect(authUrl);
});

// GET /api/auth/microsoft/callback - Exchange authorization code, link user, set session cookie
router.get('/microsoft/callback', async (req, res) => {
  const { code, error, error_description: errorDescription } = req.query;
  const { tenantId, clientId, clientSecret, redirectUri, frontendUrl } = getMicrosoftConfig();

  if (error) {
    console.error('Microsoft OAuth error:', error, errorDescription);
    return res.redirect(
      `${frontendUrl}/login?error=${encodeURIComponent(String(errorDescription || error))}`
    );
  }

  if (!code) {
    return res.redirect(
      `${frontendUrl}/login?error=${encodeURIComponent('Authorization code missing')}`
    );
  }

  try {
    // 1. Exchange authorization code for Microsoft access token
    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: String(code),
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }).toString(),
      }
    );

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || 'Failed to exchange Microsoft token');
    }

    // 2. Fetch user profile from Microsoft Graph API
    const graphRes = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const graphUser = await graphRes.json();
    if (!graphRes.ok) {
      throw new Error('Failed to fetch Microsoft user profile');
    }

    const msId = graphUser.id;
    const email = String(graphUser.mail || graphUser.userPrincipalName || '')
      .toLowerCase()
      .trim();
    const fullName =
      graphUser.displayName ||
      `${graphUser.givenName || ''} ${graphUser.surname || ''}`.trim() ||
      email;

    if (!email) {
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent('No email associated with this Microsoft account')}`
      );
    }

    // 3. Check and authorize user in database (STRICT: no open auto-provisioning)
    const user = await findUserInDatabase(msId, email);

    // If account has not been added to accounts/users table, deny access
    if (!user) {
      console.warn(`[Microsoft Auth] Rejected login for ${email}: Account not in database.`);
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent(
          'Access denied: your account is not authorized. Please contact ITSM to be added.'
        )}`
      );
    }

    // If account has been deactivated, deny access
    if (!user.is_active) {
      console.warn(`[Microsoft Auth] Rejected login for ${email}: Account is deactivated.`);
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent(
          'Your account has been deactivated. Please contact an administrator.'
        )}`
      );
    }

    // Link microsoft_id if not yet linked
    if (!user.microsoft_id || user.microsoft_id !== msId) {
      await linkMicrosoftId(user.id, msId);
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      fullName: user.full_name || fullName,
      username: user.username || email.split('@')[0],
      userLevel: user.user_level || 'admin',
    };

    // 4. Create and set HttpOnly session cookie
    const token = createSessionToken(sessionUser);
    res.cookie(SESSION_COOKIE_NAME, token, getCookieOptions(req));

    // 5. Redirect back to frontend with authorization parameters
    const redirectParams = new URLSearchParams({
      auth_success: 'true',
      email: sessionUser.email,
      fullName: sessionUser.fullName,
      userId: String(sessionUser.id),
      userLevel: sessionUser.userLevel,
      token,
    });

    return res.redirect(`${frontendUrl}/login?${redirectParams.toString()}`);
  } catch (err) {
    console.error('Microsoft OAuth callback error:', err);
    return res.redirect(
      `${frontendUrl}/login?error=${encodeURIComponent(err.message || 'Microsoft sign-in failed')}`
    );
  }
});

// GET /api/auth/verify - Verify session token from cookie or Authorization header
router.get('/verify', (req, res) => {
  const token = extractSessionToken(req);
  const decoded = decodeTokenPayload(token);
  if (!decoded || !decoded.userId) {
    return res.status(401).json({ authenticated: false, error: 'Unauthorized: valid session required' });
  }

  return res.json({
    authenticated: true,
    user: {
      id: decoded.userId,
      email: decoded.email,
      fullName: decoded.fullName,
      userLevel: decoded.userLevel,
    },
  });
});

// POST /api/auth/logout - Clear session cookie
router.post('/logout', (req, res) => {
  const { httpOnly, sameSite, secure, path } = getCookieOptions(req);
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly,
    sameSite,
    secure,
    path,
  });
  return res.json({ authenticated: false });
});

export default router;
