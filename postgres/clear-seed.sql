-- Script to clear all seed data
-- Use this to reset the database to empty state

-- Clear relationship tables first (due to foreign key constraints)
DELETE FROM user_want_to_learn;
DELETE FROM user_favorite_skills;
DELETE FROM user_skills;

-- Clear main tables
DELETE FROM skill;
DELETE FROM users;
DELETE FROM categories;

-- Reset auto-increment sequences if needed
-- SELECT setval('categories_id_seq', 1, false);
-- SELECT setval('users_id_seq', 1, false);
-- SELECT setval('skill_id_seq', 1, false);