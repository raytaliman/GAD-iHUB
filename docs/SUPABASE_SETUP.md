# Supabase Setup for CSF iHub Feedback Form

The app saves every feedback submission to a Supabase table. Follow these steps to connect your project.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. **New project** → choose organization, name, database password, region.
3. Wait for the project to be ready.

## 2. Create tables and policies (one script)

1. In the Supabase Dashboard, open **SQL Editor**.
2. Copy the contents of **`supabase_setup.sql`** from this project.
3. Paste into the SQL Editor and click **Run**.
4. This creates **`feedback_submissions`** (Part I + flexible **answers** column), **`form_parts`**, and **`questions`**. Note: the script recreates `feedback_submissions`, so any existing submissions are removed when you run it. Run dummy data (step 3) after if you want sample rows.

## 3. (Optional) Add dummy data to the database

To test the dashboard with sample feedback rows:

1. In the Supabase Dashboard, open **SQL Editor** again.
2. Copy the contents of **`supabase_dummy_data.sql`** from this project.
3. Paste into the SQL Editor and click **Run**.
4. This inserts 12 sample rows into `feedback_submissions`. You can view them under **Table Editor** → **feedback_submissions**.

## 4. Get your API credentials (Dashboard & App)

1. In the Dashboard go to **Project Settings** (gear icon) → **API**.
2. Copy:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **anon public** key under **Project API keys**.

## 5. Configure the app

1. Open **`lib/supabaseConfig.js`**.
2. Replace the placeholders:
   - `SUPABASE_URL` → your Project URL.
   - `SUPABASE_ANON_KEY` → your anon public key.

```js
export const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

3. Save the file.

## 6. Install dependencies and run

From the project root:

```powershell
npm install
npm start
```

Submitting the form will insert a row into `public.feedback_submissions`. You can view data in the Supabase Dashboard under **Table Editor** → **feedback_submissions**.

## Table columns (feedback_submissions)

| Column       | Description                                                                 |
|--------------|-----------------------------------------------------------------------------|
| id           | UUID, auto-generated                                                        |
| created_at   | Timestamp when the row was inserted                                         |
| parent_name, sex, country_code, contact_number, office_unit_address, office_unit_other, child_age, child_sex, date_of_use | Part I – basic info only |
| answers      | JSON object of all Part II–V and custom answers (e.g. `{"cleanliness_safety":"excellent","overall_satisfaction":"Very Satisfied","comments":"..."}`). Flexible when you add new questions or parts in Form Management. |

## Security note

The `anon` key is intended for client-side use. RLS policies on `feedback_submissions` allow anonymous **insert** and **select**. For production you may want to restrict **select** to authenticated users or the service role and keep **insert** open for the form.
