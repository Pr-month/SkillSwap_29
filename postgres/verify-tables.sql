-- Script to verify table structures
-- This helps ensure our seed scripts match the actual database schema

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('categories', 'users', 'skill', 'user_skills', 'user_want_to_learn', 'user_favorite_skills');

-- Check categories table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position;

-- Check users table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check skill table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'skill' 
ORDER BY ordinal_position;

-- Check user_skills table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_skills' 
ORDER BY ordinal_position;

-- Check user_want_to_learn table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_want_to_learn' 
ORDER BY ordinal_position;