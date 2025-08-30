-- Todo Application Database Schema
-- Database: todo_app
-- Created: August 28, 2025

-- Create database
CREATE DATABASE IF NOT EXISTS todo_app;
USE todo_app;

-- Users table for authentication
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Categories table for organizing todos
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Hex color code like #FF5733
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_category_user (name, user_id)
);

-- Todos table
CREATE TABLE todos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    priority ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
    due_date DATETIME,
    category_id BIGINT,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_category_id ON todos(category_id);
CREATE INDEX idx_todos_due_date ON todos(due_date);
CREATE INDEX idx_todos_completed ON todos(is_completed);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Insert sample data
INSERT INTO users (username, email, password, first_name, last_name) VALUES
('john_doe', 'john@example.com', '$2a$10$example.hash.here', 'John', 'Doe'),
('jane_smith', 'jane@example.com', '$2a$10$example.hash.here', 'Jane', 'Smith');

INSERT INTO categories (name, description, color, user_id) VALUES
('Work', 'Work-related tasks', '#FF5733', 1),
('Personal', 'Personal tasks', '#33FF57', 1),
('Shopping', 'Shopping list', '#3357FF', 2);

INSERT INTO todos (title, description, is_completed, priority, due_date, category_id, user_id) VALUES
('Complete project report', 'Finish the quarterly project report', FALSE, 'HIGH', '2025-09-01 17:00:00', 1, 1),
('Buy groceries', 'Weekly grocery shopping', FALSE, 'MEDIUM', '2025-08-30 18:00:00', 3, 2),
('Exercise', 'Go to gym for 1 hour', TRUE, 'LOW', NULL, 2, 1),
('Read book', 'Read chapter 5 of the novel', FALSE, 'LOW', '2025-09-05 20:00:00', 2, 1);
