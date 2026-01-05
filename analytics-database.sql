-- Analytics Database Schema
CREATE DATABASE IF NOT EXISTS portfolio_analytics 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE portfolio_analytics;

-- Main events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    event_data JSON,
    session_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100),
    user_agent TEXT,
    ip_address VARCHAR(45),
    referrer TEXT,
    language VARCHAR(10),
    page_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_type (event_type),
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_ip_address (ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Daily aggregated statistics
CREATE TABLE IF NOT EXISTS analytics_daily (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_events INT UNSIGNED DEFAULT 0,
    page_views INT UNSIGNED DEFAULT 0,
    unique_visitors INT UNSIGNED DEFAULT 0,
    avg_time_on_site INT UNSIGNED DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Session tracking
CREATE TABLE IF NOT EXISTS analytics_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL UNIQUE,
    user_id VARCHAR(100),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    events INT UNSIGNED DEFAULT 1,
    device_type ENUM('desktop', 'mobile', 'tablet', 'bot'),
    browser VARCHAR(50),
    os VARCHAR(50),
    country VARCHAR(2),
    city VARCHAR(100),
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_start_time (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Page performance metrics
CREATE TABLE IF NOT EXISTS analytics_performance (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    page_url VARCHAR(500) NOT NULL,
    load_time DECIMAL(8,2),
    first_contentful_paint DECIMAL(8,2),
    largest_contentful_paint DECIMAL(8,2),
    cumulative_layout_shift DECIMAL(5,3),
    first_input_delay DECIMAL(8,2),
    session_id VARCHAR(100),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_page_url (page_url(255)),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Error tracking
CREATE TABLE IF NOT EXISTS analytics_errors (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    error_type VARCHAR(50) NOT NULL,
    error_message TEXT,
    error_stack TEXT,
    page_url VARCHAR(500),
    line_number INT,
    column_number INT,
    user_agent TEXT,
    session_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_error_type (error_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User demographics (anonymized)
CREATE TABLE IF NOT EXISTS analytics_demographics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL UNIQUE,
    first_visit DATE,
    last_visit DATE,
    total_visits INT UNSIGNED DEFAULT 1,
    total_time INT UNSIGNED DEFAULT 0,
    pages_viewed INT UNSIGNED DEFAULT 1,
    device_preference ENUM('desktop', 'mobile', 'tablet'),
    browser_preference VARCHAR(50),
    country VARCHAR(2),
    language VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_country (country)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Conversion tracking
CREATE TABLE IF NOT EXISTS analytics_conversions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    conversion_type VARCHAR(50) NOT NULL,
    conversion_value DECIMAL(10,2),
    session_id VARCHAR(100),
    user_id VARCHAR(100),
    page_url VARCHAR(500),
    referrer TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_conversion_type (conversion_type),
    INDEX idx_created_at (created_at),
    INDEX idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create stored procedures for data aggregation
DELIMITER //

CREATE PROCEDURE AggregateDailyStats(IN p_date DATE)
BEGIN
    DECLARE total_events INT;
    DECLARE page_views INT;
    DECLARE unique_visitors INT;
    DECLARE avg_session_time INT;
    DECLARE bounce_rate DECIMAL(5,2);
    
    -- Calculate metrics
    SELECT COUNT(*) INTO total_events
    FROM analytics_events
    WHERE DATE(created_at) = p_date;
    
    SELECT COUNT(*) INTO page_views
    FROM analytics_events
    WHERE DATE(created_at) = p_date
    AND event_type = 'pageview';
    
    SELECT COUNT(DISTINCT session_id) INTO unique_visitors
    FROM analytics_events
    WHERE DATE(created_at) = p_date;
    
    -- Calculate bounce rate
    SELECT 
        ROUND((COUNT(CASE WHEN event_count = 1 THEN 1 END) / COUNT(*)) * 100, 2)
    INTO bounce_rate
    FROM (
        SELECT session_id, COUNT(*) as event_count
        FROM analytics_events
        WHERE DATE(created_at) = p_date
        GROUP BY session_id
    ) as session_stats;
    
    -- Insert or update daily stats
    INSERT INTO analytics_daily (date, total_events, page_views, unique_visitors, bounce_rate)
    VALUES (p_date, total_events, page_views, unique_visitors, bounce_rate)
    ON DUPLICATE KEY UPDATE
        total_events = VALUES(total_events),
        page_views = VALUES(page_views),
        unique_visitors = VALUES(unique_visitors),
        bounce_rate = VALUES(bounce_rate),
        updated_at = CURRENT_TIMESTAMP;
END //

-- Clean up old data
CREATE PROCEDURE CleanupOldData(IN days_to_keep INT)
BEGIN
    DECLARE cutoff_date DATE;
    SET cutoff_date = DATE_SUB(CURDATE(), INTERVAL days_to_keep DAY);
    
    -- Archive old data before deleting (optional)
    -- INSERT INTO analytics_events_archive SELECT * FROM analytics_events WHERE DATE(created_at) < cutoff_date;
    
    DELETE FROM analytics_events WHERE DATE(created_at) < cutoff_date;
    DELETE FROM analytics_sessions WHERE DATE(start_time) < cutoff_date;
    DELETE FROM analytics_performance WHERE DATE(created_at) < cutoff_date;
    DELETE FROM analytics_errors WHERE DATE(created_at) < cutoff_date;
END //

DELIMITER ;

-- Create views for reporting
CREATE VIEW vw_daily_stats AS
SELECT 
    date,
    total_events,
    page_views,
    unique_visitors,
    bounce_rate,
    ROUND(page_views / NULLIF(unique_visitors, 0), 2) as pages_per_visit
FROM analytics_daily
ORDER BY date DESC;

CREATE VIEW vw_top_pages AS
SELECT 
    JSON_EXTRACT(event_data, '$.label') as page,
    COUNT(*) as views,
    COUNT(DISTINCT session_id) as unique_visitors
FROM analytics_events
WHERE event_type = 'pageview'
GROUP BY page
ORDER BY views DESC;

CREATE VIEW vw_user_activity AS
SELECT 
    u.user_id,
    u.first_visit,
    u.last_visit,
    u.total_visits,
    u.total_time,
    u.pages_viewed,
    u.country,
    s.device_type,
    s.browser
FROM analytics_demographics u
LEFT JOIN analytics_sessions s ON u.user_id = s.user_id
GROUP BY u.user_id;

-- Create indexes for better performance
CREATE INDEX idx_events_composite ON analytics_events(event_type, created_at);
CREATE INDEX idx_sessions_activity ON analytics_sessions(last_activity, start_time);
CREATE INDEX idx_performance_metrics ON analytics_performance(page_url(255), created_at);

-- Create event scheduler for daily aggregation
SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS e_daily_aggregation
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 1 DAY
DO
BEGIN
    CALL AggregateDailyStats(DATE_SUB(CURDATE(), INTERVAL 1 DAY));
    CALL CleanupOldData(365); -- Keep 1 year of data
END;