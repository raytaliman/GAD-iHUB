# Fix: Adding Node.js to PATH Permanently

Node.js is installed on your system but not in your PATH environment variable. Here's how to fix it permanently:

## Quick Fix (Current Session Only)

Run this PowerShell script:
```powershell
.\setup.ps1
```

## Permanent Fix (Add to System PATH)

### Method 1: Using PowerShell (Run as Administrator)

1. **Open PowerShell as Administrator:**
   - Right-click on PowerShell
   - Select "Run as Administrator"

2. **Run this command:**
   ```powershell
   [Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\nodejs", [EnvironmentVariableTarget]::Machine)
   ```

3. **Close and reopen your terminal**

### Method 2: Using GUI (Easier)

1. **Open System Properties:**
   - Press `Win + R`
   - Type `sysdm.cpl` and press Enter
   - Or: Right-click "This PC" → Properties → Advanced system settings

2. **Open Environment Variables:**
   - Click "Environment Variables" button
   - Under "System variables", find and select "Path"
   - Click "Edit"

3. **Add Node.js path:**
   - Click "New"
   - Type: `C:\Program Files\nodejs`
   - Click "OK" on all dialogs

4. **Restart your terminal/PowerShell**

### Method 3: Using the Setup Script

Just run the provided setup script:
```powershell
.\setup.ps1
```

This will:
- Add Node.js to PATH for the current session
- Install all project dependencies
- Set up the project ready to run

## Verify It Works

After fixing PATH, open a NEW terminal and run:
```powershell
node --version
npm --version
```

You should see version numbers without errors.

## Then Install Dependencies

Once PATH is fixed:
```powershell
cd c:\Users\mildred\Desktop\ojt\CSF_IHUB
npm install
```

## Start the App

```powershell
npm start
```
