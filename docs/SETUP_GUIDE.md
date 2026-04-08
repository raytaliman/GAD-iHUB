# Setup Guide - Installing Node.js for React Native

## Step 1: Install Node.js

You need to install Node.js (which includes npm) to run this React Native project.

### Option A: Download from Official Website (Recommended)

1. **Visit the Node.js website:**
   - Go to: https://nodejs.org/
   - Download the **LTS (Long Term Support)** version for Windows
   - Choose the Windows Installer (.msi) - 64-bit version

2. **Run the Installer:**
   - Double-click the downloaded `.msi` file
   - Follow the installation wizard
   - **Important:** Make sure to check "Add to PATH" during installation
   - Click "Next" through all steps and finish the installation

3. **Verify Installation:**
   - Close and reopen your terminal/PowerShell
   - Run these commands to verify:
     ```powershell
     node --version
     npm --version
     ```
   - You should see version numbers (e.g., v20.x.x and 10.x.x)

### Option B: Using Chocolatey (If you have it installed)

If you have Chocolatey package manager installed, you can run:
```powershell
choco install nodejs-lts
```

### Option C: Using Winget (Windows Package Manager)

If you have winget installed (Windows 10/11), you can run:
```powershell
winget install OpenJS.NodeJS.LTS
```

## Step 2: Install Expo CLI (Optional but Recommended)

After Node.js is installed, you can optionally install Expo CLI globally:
```powershell
npm install -g expo-cli
```

## Step 3: Install Project Dependencies

Once Node.js is installed:

1. **Navigate to the project directory:**
   ```powershell
   cd c:\Users\mildred\Desktop\ojt\CSF_IHUB
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

## Step 4: Start the Development Server

After dependencies are installed:
```powershell
npm start
```

This will start the Expo development server. You can then:
- Press `i` to open in iOS simulator (requires Xcode on Mac)
- Press `a` to open in Android emulator (requires Android Studio)
- Scan the QR code with the Expo Go app on your phone

## Troubleshooting

### If npm is still not recognized after installation:

1. **Restart your terminal/PowerShell** - This is the most common fix
2. **Restart your computer** - Sometimes required for PATH changes to take effect
3. **Check PATH manually:**
   - Open System Properties → Environment Variables
   - Check if `C:\Program Files\nodejs\` is in your PATH
   - If not, add it manually

### If you get permission errors:

Run PowerShell as Administrator and try again.

## Alternative: Using nvm-windows (Node Version Manager)

If you want to manage multiple Node.js versions, you can use nvm-windows:

1. Download from: https://github.com/coreybutler/nvm-windows/releases
2. Install nvm-windows
3. Then install Node.js:
   ```powershell
   nvm install lts
   nvm use lts
   ```

## Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Go to https://supabase.com and sign up/login
2. Create a new project
3. Note your project URL and anon key from Settings → API

### Step 2: Configure Environment Variables

1. **For React Native app:**
   - Update `lib/supabaseConfig.js` with your Supabase URL and anon key

2. **For Dashboard:**
   - Create `dashboard/.env` file:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     ```

### Step 3: Run SQL Scripts

1. **Open Supabase SQL Editor:**
   - Go to your Supabase project dashboard
   - Click on "SQL Editor" in the left sidebar

2. **Run the main setup script:**
   - Copy the contents of `supabase_setup.sql`
   - Paste into the SQL Editor
   - Click "Run" to create all tables (feedback_submissions, form_parts, questions, users)

3. **Optional - Add dummy data:**
   - Copy the contents of `supabase_dummy_data.sql`
   - Paste and run to add sample feedback data
   - Copy the contents of `supabase_users_dummy_data.sql`
   - Paste and run to add sample users

### Step 4: Verify Tables

After running the SQL scripts, verify that these tables exist:
- `feedback_submissions`
- `basic_info_fields`
- `form_parts`
- `questions`
- `users`

You can check in Supabase Dashboard → Table Editor.

### Important Notes:

- **Password Security:** The users table stores `password_hash`. In production, implement proper password hashing (bcrypt) or use Supabase Auth.
- **Row Level Security:** All tables have RLS enabled. Adjust policies based on your security requirements.
- **Users Table:** The users table is now connected and ready to use with the User Management page.

## Need Help?

If you encounter any issues during installation, please let me know the error message and I'll help you troubleshoot!
