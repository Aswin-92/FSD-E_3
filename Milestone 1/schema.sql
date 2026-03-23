-- ============================================================
--  Real-Time Event Synchronization Engine – Database Schema
--  Compatible with MySQL 5.7+ / MariaDB 10.3+ (XAMPP)
-- ============================================================

CREATE DATABASE IF NOT EXISTS rtese_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE rtese_db;

-- ----------------------------------------------------------
-- 1. USERS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(60)  NOT NULL UNIQUE,
  email       VARCHAR(120) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  avatar_color VARCHAR(7)  NOT NULL DEFAULT '#4F8EF7',
  role        ENUM('admin','editor','viewer') NOT NULL DEFAULT 'viewer',
  is_online   TINYINT(1)   NOT NULL DEFAULT 0,
  last_seen   DATETIME     NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 2. CHANNELS  (logical event streams)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS channels (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(80)  NOT NULL UNIQUE,
  description TEXT         NULL,
  color       VARCHAR(7)   NOT NULL DEFAULT '#22D3EE',
  created_by  INT UNSIGNED NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 3. EVENTS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  channel_id  INT UNSIGNED    NOT NULL,
  user_id     INT UNSIGNED    NOT NULL,
  type        VARCHAR(40)     NOT NULL DEFAULT 'message',
  payload     JSON            NOT NULL,
  status      ENUM('pending','delivered','acknowledged','failed')
              NOT NULL DEFAULT 'pending',
  created_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  INDEX idx_channel_time (channel_id, created_at),
  INDEX idx_status       (status)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 4. EVENT ACKNOWLEDGEMENTS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_acks (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id    BIGINT UNSIGNED NOT NULL,
  user_id     INT UNSIGNED    NOT NULL,
  acked_at    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_ack (event_id, user_id),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 5. SYNC LOG  (audit trail)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS sync_log (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id    BIGINT UNSIGNED NOT NULL,
  action      VARCHAR(40)     NOT NULL,
  meta        JSON            NULL,
  logged_at   DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_logged (logged_at)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 6. SEED DATA
-- ----------------------------------------------------------
INSERT IGNORE INTO users (username, email, password, avatar_color, role) VALUES
  ('admin',   'admin@rtese.dev',   MD5('admin123'),  '#F472B6', 'admin'),
  ('alice',   'alice@rtese.dev',   MD5('alice123'),  '#34D399', 'editor'),
  ('bob',     'bob@rtese.dev',     MD5('bob123'),    '#FBBF24', 'editor'),
  ('charlie', 'charlie@rtese.dev', MD5('charlie123'),'#A78BFA', 'viewer');

INSERT IGNORE INTO channels (name, description, color, created_by) VALUES
  ('general',    'Public broadcast channel',         '#22D3EE', 1),
  ('alerts',     'System alerts & notifications',    '#F87171', 1),
  ('analytics',  'Live analytics event stream',      '#34D399', 1),
  ('deployments','Deployment pipeline events',       '#FBBF24', 1);
