import * as QRCode from 'qrcode';
import dostLogo from '../assets/dost_logo.png';
import gadLogo from '../assets/logo.png';

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Generates an official GAD Innovation Hub Access Pass ID Card as a PNG Data URL.
 */
export async function generateIdCardImage({ code, parentName, contactNumber, countryCode, email }) {
  const canvas = document.createElement('canvas');
  canvas.width = 856;
  canvas.height = 540;
  const ctx = canvas.getContext('2d');

  // Load images
  const qrDataUrl = await QRCode.toDataURL(String(code || 'N/A'), {
    width: 320,
    margin: 1,
    color: { dark: '#7030a0', light: '#ffffff' },
  }).catch(() => '');

  const [qrImg, dostImg, gadImg] = await Promise.all([
    loadImage(qrDataUrl),
    loadImage(dostLogo),
    loadImage(gadLogo),
  ]);

  // Card Background
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 12, 12, 832, 516, 20);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Purple Left Accent Stripe
  ctx.save();
  roundRect(ctx, 12, 12, 832, 516, 20);
  ctx.clip();
  ctx.fillStyle = '#7030a0';
  ctx.fillRect(12, 12, 18, 516);
  ctx.restore();

  // Header - DOST Seal & Text
  if (dostImg) {
    ctx.drawImage(dostImg, 48, 28, 64, 64);
  }

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('REPUBLIC OF THE PHILIPPINES', 124, 44);

  ctx.fillStyle = '#1e293b';
  ctx.font = '900 16px system-ui, -apple-system, sans-serif';
  ctx.fillText('DEPARTMENT OF SCIENCE AND TECHNOLOGY', 124, 65);

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('Ilocos Region', 124, 83);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('City of San Fernando, La Union', 124, 98);

  // Divider Line
  ctx.beginPath();
  ctx.moveTo(48, 110);
  ctx.lineTo(815, 110);
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Visitor Details (Left)
  // 1. Parent / Guardian
  ctx.fillStyle = '#94a3b8';
  ctx.font = '900 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('PARENT / GUARDIAN', 48, 155);

  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  let nameStr = parentName || 'Valued Visitor';
  while (ctx.measureText(nameStr).width > 470 && nameStr.length > 5) {
    nameStr = nameStr.slice(0, -1);
  }
  if (nameStr !== parentName) nameStr += '...';
  ctx.fillText(nameStr, 48, 188);

  // 2. Contact Number
  ctx.fillStyle = '#94a3b8';
  ctx.font = '900 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('CONTACT NUMBER', 48, 240);

  ctx.fillStyle = '#334155';
  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  const fullPhone = `${countryCode ? countryCode + ' ' : ''}${contactNumber || '–'}`;
  ctx.fillText(fullPhone, 48, 270);

  // 3. Email Address
  ctx.fillStyle = '#94a3b8';
  ctx.font = '900 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('EMAIL ADDRESS', 48, 320);

  ctx.fillStyle = '#334155';
  ctx.font = 'bold 17px system-ui, -apple-system, sans-serif';
  let emailStr = email || '–';
  while (ctx.measureText(emailStr).width > 470 && emailStr.length > 5) {
    emailStr = emailStr.slice(0, -1);
  }
  if (emailStr !== email) emailStr += '...';
  ctx.fillText(emailStr, 48, 350);

  // Vertical Dashed Divider
  ctx.beginPath();
  ctx.setLineDash([6, 6]);
  ctx.moveTo(540, 125);
  ctx.lineTo(540, 430);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);

  // QR Code Box (Right)
  if (qrImg) {
    ctx.drawImage(qrImg, 565, 140, 230, 230);
  }
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('Code ID:', 605, 395);

  ctx.fillStyle = '#7030a0';
  ctx.font = '900 24px system-ui, -apple-system, sans-serif';
  ctx.fillText(String(code), 670, 396);

  // Footer Divider Line
  ctx.beginPath();
  ctx.moveTo(48, 440);
  ctx.lineTo(815, 440);
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Footer - GAD Logo & Scan Tag
  if (gadImg) {
    const aspect = gadImg.naturalWidth / gadImg.naturalHeight;
    const h = 50;
    const w = h * aspect;
    ctx.drawImage(gadImg, 48, 455, w, h);
  }

  ctx.fillStyle = '#94a3b8';
  ctx.font = '900 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('SCAN TO CHECK-IN', 660, 486);

  return canvas.toDataURL('image/png');
}
