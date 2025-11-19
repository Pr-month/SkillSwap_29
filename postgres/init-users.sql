-- Seed data for users table
-- Note: Passwords are hashed using bcrypt with salt rounds = 10
-- Regular user password: user123
-- Admin password: admin123
INSERT INTO users (id, "yandexId", "googleId", name, email, password, about, birthdate, city, gender, avatar, role, "refreshToken") VALUES
('30000000-0000-0000-0000-000000000001', NULL, NULL, 'Иван Петров', 'ivan@example.com', '$2b$10$2cGnIM58HoLoqgnrmzcX7.IQAs7s73mHtwgL6ttCjjJW.ZDuoJsW2', 'Фронтенд разработчик, учу React и современный JavaScript', '1992-05-15', 'Санкт-Петербург', 'MALE', 'https://i.pravatar.cc/150?img=32', 'USER', NULL),
('30000000-0000-0000-0000-000000000002', NULL, NULL, 'Анна Сидорова', 'anna@example.com', '$2b$10$2cGnIM58HoLoqgnrmzcX7.IQAs7s73mHtwgL6ttCjjJW.ZDuoJsW2', 'Дизайнер интерфейсов, учу английский язык', '1995-08-22', 'Екатеринбург', 'FEMALE', 'https://i.pravatar.cc/150?img=45', 'USER', NULL),
('30000000-0000-0000-0000-000000000003', NULL, NULL, 'Алексей Иванов', 'alex@example.com', '$2b$10$2cGnIM58HoLoqgnrmzcX7.IQAs7s73mHtwgL6ttCjjJW.ZDuoJsW2', 'Бэкенд разработчик, учу TypeScript и Node.js', '1991-11-30', 'Новосибирск', 'MALE', 'https://i.pravatar.cc/150?img=15', 'USER', NULL),
('30000000-0000-0000-0000-000000000004', NULL, NULL, 'Мария Кузнецова', 'maria@example.com', '$2b$10$2cGnIM58HoLoqgnrmzcX7.IQAs7s73mHtwgL6ttCjjJW.ZDuoJsW2', 'Маркетолог, учу копирайтинг и SMM', '1993-04-18', 'Казань', 'FEMALE', 'https://i.pravatar.cc/150?img=22', 'USER', NULL),
('30000000-0000-0000-0000-000000000005', NULL, NULL, 'Дмитрий Смирнов', 'dmitry@example.com', '$2b$10$2cGnIM58HoLoqgnrmzcX7.IQAs7s73mHtwgL6ttCjjJW.ZDuoJsW2', 'Фотограф, учу видеомонтаж в Adobe Premiere Pro', '1994-07-25', 'Сочи', 'MALE', 'https://i.pravatar.cc/150?img=8', 'USER', NULL);

-- Admin user
INSERT INTO users (id, "yandexId", "googleId", name, email, password, about, birthdate, city, gender, avatar, role, "refreshToken") VALUES
('30000000-0000-0000-0000-000000000006', NULL, NULL, 'Администратор Системы', 'admin@skillswap.com', '$2b$10$DDMXvAUCS2DR38sLdOw0geAw8zpIIt8NKFS2RGJse50EXyN/AMGpC', 'Системный администратор платформы', '1990-01-01', 'Москва', 'UNKNOWN', 'https://i.pravatar.cc/150?img=1', 'ADMIN', NULL);