-- Seed sample data for testing
INSERT INTO public.registrations (code, parent_name, sex, contact_number, service_availed, province, created_at)
VALUES 
  ('TEST-001', 'John Doe', 'Male', '09123456789', 'Library Service', 'Ilocos Norte', now() - interval '2 days'),
  ('TEST-002', 'Jane Smith', 'Female', '09987654321', 'Laboratory Service', 'Ilocos Sur', now() - interval '1 day')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.evaluations (registration_id, answers, comments)
SELECT id, '{"cleanliness_safety": 5, "child_comfort": 4}'::jsonb, 'Initial test evaluation'
FROM public.registrations
WHERE code LIKE 'TEST-%'
AND id NOT IN (SELECT registration_id FROM public.evaluations);
