-- Test script to verify the seed data
-- This script can be used to verify that all data was inserted correctly

-- Count categories
SELECT 'Categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Skills' as table_name, COUNT(*) as count FROM skill
UNION ALL
SELECT 'User Skills' as table_name, COUNT(*) as count FROM user_skills
UNION ALL
SELECT 'User Want To Learn' as table_name, COUNT(*) as count FROM user_want_to_learn;

-- Show some sample data
SELECT 'Sample Categories' as info;
SELECT id, name, "parentId" FROM categories LIMIT 5;

SELECT 'Sample Users' as info;
SELECT id, name, email, role FROM users LIMIT 5;

SELECT 'Sample Skills' as info;
SELECT id, title, "categoryId", "ownerId" FROM skill LIMIT 5;