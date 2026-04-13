DROP TRIGGER IF EXISTS trg_user_roles_audit_after_insert;
DROP TRIGGER IF EXISTS trg_user_roles_audit_before_delete;

DELIMITER $$

CREATE TRIGGER trg_user_roles_audit_after_insert
AFTER INSERT ON `user_roles_role`
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    actor_user_id,
    old_data,
    new_data,
    changed_fields,
    description
  )
  VALUES (
    'user_roles_role',
    CONCAT(CAST(NEW.userId AS CHAR), ':', CAST(NEW.roleId AS CHAR)),
    'INSERT',
    @app_user_id,
    NULL,
    JSON_OBJECT(
      'userId', NEW.userId,
      'roleId', NEW.roleId
    ),
    JSON_ARRAY('roleId'),
    CONCAT('Role assigned to user: ', NEW.userId, ' -> ', NEW.roleId)
  );
END$$

CREATE TRIGGER trg_user_roles_audit_before_delete
BEFORE DELETE ON `user_roles_role`
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    actor_user_id,
    old_data,
    new_data,
    changed_fields,
    description
  )
  VALUES (
    'user_roles_role',
    CONCAT(CAST(OLD.userId AS CHAR), ':', CAST(OLD.roleId AS CHAR)),
    'DELETE',
    @app_user_id,
    JSON_OBJECT(
      'userId', OLD.userId,
      'roleId', OLD.roleId
    ),
    NULL,
    JSON_ARRAY('roleId'),
    CONCAT('Role removed from user: ', OLD.userId, ' -> ', OLD.roleId)
  );
END$$

DELIMITER ;
