-- Local-only seed: creates a test admin user for E2E testing.
-- This file is applied by `supabase start` / `supabase db reset` and never runs in production.
-- Credentials: admin@test.local / TestPassword123!

create extension if not exists pgcrypto;

-- Insert into auth.users and auth.identities together via CTE so both rows share the same UUID.
with new_user as (
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@test.local',
    crypt('TestPassword123!', gen_salt('bf')),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '', '', '', ''
  )
  returning id
)
insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  new_user.id,
  jsonb_build_object('sub', new_user.id::text, 'email', 'admin@test.local'),
  'email',
  'admin@test.local',
  now(),
  now(),
  now()
from new_user;
