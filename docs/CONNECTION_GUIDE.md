# Connecting to the Expo Dev Server

If your phone won't connect to the server, use one of these options:

## Option 1: Tunnel mode (works from anywhere)

Use a public URL so your phone can connect even on a different network:

```powershell
npm run start:tunnel
```

Or:

```powershell
npx expo start --tunnel
```

The first time you use tunnel, it may prompt to install `@expo/ngrok`. Say yes.  
Then scan the **tunnel** QR code (or use the `exp://` URL shown) in Expo Go.

## Option 2: Same Wi‑Fi (LAN)

1. Phone and computer must be on the **same Wi‑Fi**.
2. Start the server:
   ```powershell
   npm start
   ```
3. In the terminal, look for a line like:
   `Metro waiting on exp://192.168.x.x:8081` or `exp://10.x.x.x:8081`.
4. In Expo Go, choose “Enter URL manually” and type that `exp://...` URL, or scan the QR code.

If you only see `exp://127.0.0.1:8081`, your machine may be blocking LAN access. Use **Option 1 (tunnel)** instead.

## Option 3: Test in the browser (no phone)

You can run the app in the browser:

```powershell
npm start
```

Then press **`w`** in the terminal to open the project in the browser.

## Firewall

If you use LAN (Option 2) and the phone still can’t connect:

- Windows: allow Node / “Node.js JavaScript Runtime” or “javaw” for **Private** networks.
- Or allow **inbound TCP** on port **8081** for your local IP.

Easiest way to avoid firewall/LAN issues is **Option 1: tunnel**.
