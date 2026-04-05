DROP TRIGGER IF EXISTS trg_user_audit_after_insert;
DROP TRIGGER IF EXISTS trg_user_audit_after_update;
DROP TRIGGER IF EXISTS trg_user_audit_before_delete;

DELIMITER $$

CREATE TRIGGER trg_user_audit_after_insert
AFTER INSERT ON `user`
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
    'users',
    CAST(NEW.Id AS CHAR),
    'INSERT',
    @app_user_id,
    NULL,
    JSON_OBJECT(
      'Id', NEW.Id,
      'IDcard', NEW.IDcard,
      'Name', NEW.Name,
      'Surname1', NEW.Surname1,
      'Surname2', NEW.Surname2,
      'ProfilePhoto', NEW.ProfilePhoto,
      'Nis', NEW.Nis,
      'Email', NEW.Email,
      'PhoneNumber', NEW.PhoneNumber,
      'Birthdate', NEW.Birthdate,
      'Address', NEW.Address,
      'IsActive', NEW.IsActive
    ),
    NULL,
    CONCAT('User created: ', NEW.Email)
  );
END$$

CREATE TRIGGER trg_user_audit_after_update
AFTER UPDATE ON `user`
FOR EACH ROW
BEGIN
  DECLARE changed_fields_json JSON DEFAULT JSON_ARRAY();

  IF NOT (OLD.IDcard <=> NEW.IDcard) THEN
    SET changed_fields_json = JSON_ARRAY_APPEND(changed_fields_json, '$', 'IDcard');
  END IF;
  IF NOT (OLD.Name <=> NEW.Name) THEN
    SET changed_fields_json = JSON_ARRAY_APPEND(changed_fields_json, '$', 'Name');
  END IF;
  IF NOT (OLD.Surname1 <=> NEW.Surname1) THEN
    SET changed_fields_json = JSON_ARRAY_APPEND(changed_fields_json, '$', 'Surname1');
  END IF;
  IF NOT (OLD.Surname2 <=> NEW.Surname2) THEN
    SET changed_fields_json = JSON_ARRAY_APPEND(changed_fields_json, '$', 'Surname2');
  END IF;
  IF NOT (OLD.ProfilePhoto <=> NEW.ProfilePhoto) THEN
    SET changed_fields_json = JSON_ARRAY_APPEND(changed_fields_json, '$', 'ProfilePhoto');
  END IF;
  IF NOT (OLD.Nis <=> NEW.Nis) THEN
    SET changed_fields_json = JSON_ARRAY_APPEND(changed_fields_json, '$', 'Nis');
  END IF;
  IF NOT (OLD.Email <=> NEW.Email) THEN
    SET changed_fields_json = JSON_ARRAY_APPEND(changed_fields_json, '$', 'Email');
  END IF;
  IF NOT (OLD.PhoneNumber <=> NEW.PhoneNumber) THEN
    SET changed_fields_json = JSON_ARRAY_APPEND(changed_fields_json, '$', 'PhoneNumber');
  END IF;
  IF NOT (OLD.Birthdate <=> NEW.Birthdate) THEN
    SET changed_fields_json = JSON_ARRAY_APPEND(changed_fields_json, '$', 'Birthdate');
  END IF;
  IF NOT (OLD.Address <=> NEW.Address) THEN
    SET changed_fields_json = JSON_ARRAY_APPEND(changed_fields_json, '$', 'Address');
  END IF;
  IF NOT (OLD.IsActive <=> NEW.IsActive) THEN
    SET changed_fields_json = JSON_ARRAY_APPEND(changed_fields_json, '$', 'IsActive');
  END IF;

  IF JSON_LENGTH(changed_fields_json) > 0 THEN
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
      'users',
      CAST(NEW.Id AS CHAR),
      'UPDATE',
      @app_user_id,
      JSON_OBJECT(
        'Id', OLD.Id,
        'IDcard', OLD.IDcard,
        'Name', OLD.Name,
        'Surname1', OLD.Surname1,
        'Surname2', OLD.Surname2,
        'ProfilePhoto', OLD.ProfilePhoto,
        'Nis', OLD.Nis,
        'Email', OLD.Email,
        'PhoneNumber', OLD.PhoneNumber,
        'Birthdate', OLD.Birthdate,
        'Address', OLD.Address,
        'IsActive', OLD.IsActive
      ),
      JSON_OBJECT(
        'Id', NEW.Id,
        'IDcard', NEW.IDcard,
        'Name', NEW.Name,
        'Surname1', NEW.Surname1,
        'Surname2', NEW.Surname2,
        'ProfilePhoto', NEW.ProfilePhoto,
        'Nis', NEW.Nis,
        'Email', NEW.Email,
        'PhoneNumber', NEW.PhoneNumber,
        'Birthdate', NEW.Birthdate,
        'Address', NEW.Address,
        'IsActive', NEW.IsActive
      ),
      changed_fields_json,
      CONCAT('User updated: ', NEW.Email)
    );
  END IF;
END$$

CREATE TRIGGER trg_user_audit_before_delete
BEFORE DELETE ON `user`
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
    'users',
    CAST(OLD.Id AS CHAR),
    'DELETE',
    @app_user_id,
    JSON_OBJECT(
      'Id', OLD.Id,
      'IDcard', OLD.IDcard,
      'Name', OLD.Name,
      'Surname1', OLD.Surname1,
      'Surname2', OLD.Surname2,
      'ProfilePhoto', OLD.ProfilePhoto,
      'Nis', OLD.Nis,
      'Email', OLD.Email,
      'PhoneNumber', OLD.PhoneNumber,
      'Birthdate', OLD.Birthdate,
      'Address', OLD.Address,
      'IsActive', OLD.IsActive
    ),
    NULL,
    NULL,
    CONCAT('User deleted: ', OLD.Email)
  );
END$$

DELIMITER ;
