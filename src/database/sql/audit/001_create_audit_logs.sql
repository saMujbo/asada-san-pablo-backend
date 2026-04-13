CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  table_name VARCHAR(100) NOT NULL,
  record_id VARCHAR(191) NOT NULL,
  action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
  actor_user_id INT NULL,
  old_data JSON NULL,
  new_data JSON NULL,
  changed_fields JSON NULL,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_audit_logs_table_record (table_name, record_id),
  INDEX idx_audit_logs_actor_created (actor_user_id, created_at),
  INDEX idx_audit_logs_created_at (created_at)
);
