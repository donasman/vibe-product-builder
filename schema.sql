-- Saju Analysis Project Database Schema

-- Create Database
CREATE DATABASE IF NOT EXISTS saju_db 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE saju_db;

-- Create Table for Analysis Results
CREATE TABLE IF NOT EXISTS analysis_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    saju_text VARCHAR(255) NOT NULL,
    pillar_text VARCHAR(255) NOT NULL,
    analysis_data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
