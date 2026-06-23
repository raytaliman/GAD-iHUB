-- CSF iHub Unified Database Setup
-- This script initializes the entire database schema, including tables, 
-- policies, metadata, and initial seed data.

-- 0. Cleanup
DROP TABLE IF EXISTS public.evaluations CASCADE;
DROP TABLE IF EXISTS public.registrations CASCADE;
DROP TABLE IF EXISTS public.basic_info_fields CASCADE;
DROP TABLE IF EXISTS public.form_parts CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 1. Core Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Registrations table (Part I - Profile)
CREATE TABLE public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  first_name text,
  middle_name text,
  last_name text,
  parent_name text,
  sex text,
  email text,
  birthdate date,
  country_code text,
  contact_number text,
  client_type text DEFAULT 'Internal',
  office_unit_address text,
  office_unit_other text,
  province text,
  city text,
  barangay text,
  children jsonb DEFAULT '[]'::jsonb,
  date_of_use date,
  service_availed text,
  activities text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous insert" ON public.registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous select" ON public.registrations FOR SELECT USING (true);
CREATE POLICY "Allow anonymous update" ON public.registrations FOR UPDATE USING (true);

-- 3. Evaluations table (Part II-IV - Feedback)
CREATE TABLE public.evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  answers jsonb DEFAULT '{}'::jsonb,
  comments text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous insert" ON public.evaluations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous select" ON public.evaluations FOR SELECT USING (true);

-- 4. Basic Information Fields (Metadata for registration form)
CREATE TABLE public.basic_info_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0,
  label text NOT NULL,
  field_type text NOT NULL DEFAULT 'text' CHECK (field_type IN ('text', 'select', 'date', 'tel')),
  required boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.basic_info_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read basic_info_fields" ON public.basic_info_fields FOR SELECT USING (true);

INSERT INTO public.basic_info_fields (key, sort_order, label, field_type, required) VALUES
('first_name', 0, 'First Name', 'text', true),
('last_name', 1, 'Last Name', 'text', true),
('sex', 2, 'Sex', 'select', false),
('country_code', 3, 'Country Code', 'text', false),
('contact_number', 4, 'Contact Number', 'tel', true),
('client_type', 5, 'Client Type', 'select', true),
('office_unit_address', 6, 'Office/Unit/Address', 'select', false),
('office_unit_other', 7, 'Other (please specify)', 'text', false),
('province', 8, 'Province', 'text', false),
('city', 9, 'City/Municipality', 'text', false),
('barangay', 10, 'Barangay', 'text', false),
('service_availed', 11, 'Service Availed', 'text', false),
('activities', 12, 'Activities/Nature of Visit', 'text', false),
('date_of_use', 13, 'Date of Visit', 'date', false)
ON CONFLICT (key) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  label = EXCLUDED.label,
  field_type = EXCLUDED.field_type,
  required = EXCLUDED.required;

-- 5. Form parts (Sections)
CREATE TABLE public.form_parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0,
  label text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.form_parts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read form_parts" ON public.form_parts FOR SELECT USING (true);

INSERT INTO public.form_parts (key, sort_order, label) VALUES
('part2', 0, 'Part II – Facility and Service Evaluation'),
('part3', 1, 'Part III – Staff Evaluation'),
('part4', 2, 'Part IV – Overall Satisfaction')
ON CONFLICT (key) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  label = EXCLUDED.label;

-- 6. Questions
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  part text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  answer_type text NOT NULL DEFAULT 'emoji' CHECK (answer_type IN ('emoji', 'satisfaction', 'text', 'radio')),
  options jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read questions" ON public.questions FOR SELECT USING (true);

INSERT INTO public.questions (part, sort_order, key, label, answer_type) VALUES
('part2', 0, 'cleanliness_safety', 'Cleanliness and safety of the station', 'emoji'),
('part2', 1, 'child_comfort', 'Child''s comfort and enjoyment in the facility', 'emoji'),
('part2', 2, 'toys_materials', 'Availability and quality of toys/materials', 'emoji'),
('part2', 3, 'staff_attentiveness', 'Attentiveness and support of staff', 'emoji'),
('part2', 4, 'accessibility_convenience', 'Accessibility and convenience of location', 'emoji'),
('part2', 5, 'maintenance_upkeep', 'Maintenance and upkeep of the facility', 'emoji'),
('part2', 6, 'staff_responsiveness', 'Responsiveness of staff to parents'' concerns', 'emoji'),
('part3', 0, 'staff_eval_attentiveness', 'Attentiveness and support of staff', 'emoji'),
('part3', 1, 'staff_eval_friendliness', 'Friendliness and courtesy', 'emoji'),
('part3', 2, 'staff_eval_responsiveness', 'Responsiveness to parents'' concerns', 'emoji'),
('part4', 0, 'overall_satisfaction', 'How satisfied are you with your overall experience using the Child-Minding Station?', 'satisfaction')
ON CONFLICT (key) DO UPDATE SET
  part = EXCLUDED.part,
  sort_order = EXCLUDED.sort_order,
  label = EXCLUDED.label,
  answer_type = EXCLUDED.answer_type;

-- 7. Users
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  password_hash text,
  user_level text NOT NULL DEFAULT 'assistant' CHECK (user_level IN ('admin', 'assistant')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update users" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Allow delete users" ON public.users FOR DELETE USING (true);

-- Updated_at Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Default Admin Users
INSERT INTO public.users (username, email, password_hash, user_level, is_active) VALUES
('admin', 'admin@ihub.dost.gov.ph', 'admin', 'admin', true),
('admin_new', 'admin', 'admin', 'admin', true),
('admin_gmail', 'admin@gmail.com', 'admin', 'admin', true)
ON CONFLICT (username) DO NOTHING;

-- 8. Final Permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 9. Dummy Data Seed (10 responses)
DO $$
DECLARE
    reg_id uuid;
    i int;
    parent_names text[] := ARRAY['Juan Dela Cruz', 'Maria Santos', 'Oliver Twist', 'Elena Gilbert', 'Damon Salvatore', 'Stefan Salvatore', 'Bonnie Bennett', 'Caroline Forbes', 'Jeremy Gilbert', 'Alaric Saltzman'];
    sexes text[] := ARRAY['Male', 'Female', 'Male', 'Female', 'Male', 'Male', 'Female', 'Female', 'Male', 'Male'];
    satisfaction_options text[] := ARRAY['Very Satisfied', 'Satisfied', 'Neutral', 'Satisfied', 'Very Satisfied'];
    rating_options text[] := ARRAY['excellent', 'veryGood', 'good', 'excellent', 'veryGood'];
BEGIN
    FOR i IN 1..10 LOOP
        INSERT INTO public.registrations (
            code, first_name, last_name, parent_name, sex, contact_number, client_type, office_unit_address, date_of_use, children, created_at
        ) VALUES (
            'ABC' || floor(random() * 900 + 100)::text,
            split_part(parent_names[i], ' ', 1),
            split_part(parent_names[i], ' ', 2),
            parent_names[i],
            sexes[i],
            '09' || floor(random() * 90000000 + 10000000)::text,
            'Internal',
            'Regional Office ' || i,
            CURRENT_DATE - (i || ' days')::INTERVAL,
            '[{"name": "Child", "age": 5, "sex": "Male"}]'::jsonb,
            NOW() - (i || ' days')::INTERVAL
        ) RETURNING id INTO reg_id;

        INSERT INTO public.evaluations (registration_id, answers, comments, created_at)
        VALUES (
            reg_id,
            jsonb_build_object(
                'cleanliness_safety', rating_options[1 + floor(random() * 5)],
                'child_comfort', rating_options[1 + floor(random() * 5)],
                'toys_materials', rating_options[1 + floor(random() * 5)],
                'overall_satisfaction', satisfaction_options[1 + floor(random() * 5)]
            ),
            'Sample feedback response ' || i,
            NOW() - (i || ' days')::INTERVAL
        );
    END LOOP;
END $$;
