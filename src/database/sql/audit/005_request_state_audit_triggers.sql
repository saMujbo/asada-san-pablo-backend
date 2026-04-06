/*
  Auditoria solo para cambios de estado en las cinco tablas de solicitudes.
  Solo registra en audit_logs cuando cambia StateRequestId.

  Estas sentencias asumen los nombres de tabla generados por TypeORM
  cuando se usa @Entity() sin nombre explicito:
  - reques_availability_water
  - request_associated
  - request_change_meter
  - request_change_name_meter
  - request_supervision_meter

  Si en la base real el nombre difiere, ajusta el ON <tabla> antes de ejecutar.
*/

DROP TRIGGER IF EXISTS trg_reques_availability_water_audit_after_update;
DROP TRIGGER IF EXISTS trg_request_associated_audit_after_update;
DROP TRIGGER IF EXISTS trg_request_change_meter_audit_after_update;
DROP TRIGGER IF EXISTS trg_request_change_name_meter_audit_after_update;
DROP TRIGGER IF EXISTS trg_request_supervision_meter_audit_after_update;

DELIMITER $$

CREATE TRIGGER trg_reques_availability_water_audit_after_update
AFTER UPDATE ON `reques_availability_water`
FOR EACH ROW
BEGIN
  IF NOT (OLD.StateRequestId <=> NEW.StateRequestId) THEN
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
      'request_availability_water',
      CAST(NEW.Id AS CHAR),
      'UPDATE',
      @app_user_id,
      JSON_OBJECT(
        'Id', OLD.Id,
        'UserId', OLD.UserId,
        'StateRequestId', OLD.StateRequestId
      ),
      JSON_OBJECT(
        'Id', NEW.Id,
        'UserId', NEW.UserId,
        'StateRequestId', NEW.StateRequestId
      ),
      JSON_ARRAY('StateRequestId'),
      CONCAT(
        'Cambio de estado en solicitud de disponibilidad: ',
        COALESCE(CAST(OLD.StateRequestId AS CHAR), 'NULL'),
        ' -> ',
        COALESCE(CAST(NEW.StateRequestId AS CHAR), 'NULL')
      )
    );
  END IF;
END$$

CREATE TRIGGER trg_request_associated_audit_after_update
AFTER UPDATE ON `request_associated`
FOR EACH ROW
BEGIN
  IF NOT (OLD.StateRequestId <=> NEW.StateRequestId) THEN
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
      'request_associated',
      CAST(NEW.Id AS CHAR),
      'UPDATE',
      @app_user_id,
      JSON_OBJECT(
        'Id', OLD.Id,
        'UserId', OLD.UserId,
        'StateRequestId', OLD.StateRequestId
      ),
      JSON_OBJECT(
        'Id', NEW.Id,
        'UserId', NEW.UserId,
        'StateRequestId', NEW.StateRequestId
      ),
      JSON_ARRAY('StateRequestId'),
      CONCAT(
        'Cambio de estado en solicitud de asociado: ',
        COALESCE(CAST(OLD.StateRequestId AS CHAR), 'NULL'),
        ' -> ',
        COALESCE(CAST(NEW.StateRequestId AS CHAR), 'NULL')
      )
    );
  END IF;
END$$

CREATE TRIGGER trg_request_change_meter_audit_after_update
AFTER UPDATE ON `request_change_meter`
FOR EACH ROW
BEGIN
  IF NOT (OLD.StateRequestId <=> NEW.StateRequestId) THEN
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
      'request_change_meter',
      CAST(NEW.Id AS CHAR),
      'UPDATE',
      @app_user_id,
      JSON_OBJECT(
        'Id', OLD.Id,
        'UserId', OLD.UserId,
        'StateRequestId', OLD.StateRequestId
      ),
      JSON_OBJECT(
        'Id', NEW.Id,
        'UserId', NEW.UserId,
        'StateRequestId', NEW.StateRequestId
      ),
      JSON_ARRAY('StateRequestId'),
      CONCAT(
        'Cambio de estado en solicitud de cambio de medidor: ',
        COALESCE(CAST(OLD.StateRequestId AS CHAR), 'NULL'),
        ' -> ',
        COALESCE(CAST(NEW.StateRequestId AS CHAR), 'NULL')
      )
    );
  END IF;
END$$

CREATE TRIGGER trg_request_change_name_meter_audit_after_update
AFTER UPDATE ON `request_change_name_meter`
FOR EACH ROW
BEGIN
  IF NOT (OLD.StateRequestId <=> NEW.StateRequestId) THEN
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
      'request_change_name_meter',
      CAST(NEW.Id AS CHAR),
      'UPDATE',
      @app_user_id,
      JSON_OBJECT(
        'Id', OLD.Id,
        'UserId', OLD.UserId,
        'StateRequestId', OLD.StateRequestId
      ),
      JSON_OBJECT(
        'Id', NEW.Id,
        'UserId', NEW.UserId,
        'StateRequestId', NEW.StateRequestId
      ),
      JSON_ARRAY('StateRequestId'),
      CONCAT(
        'Cambio de estado en solicitud de cambio de nombre: ',
        COALESCE(CAST(OLD.StateRequestId AS CHAR), 'NULL'),
        ' -> ',
        COALESCE(CAST(NEW.StateRequestId AS CHAR), 'NULL')
      )
    );
  END IF;
END$$

CREATE TRIGGER trg_request_supervision_meter_audit_after_update
AFTER UPDATE ON `request_supervision_meter`
FOR EACH ROW
BEGIN
  IF NOT (OLD.StateRequestId <=> NEW.StateRequestId) THEN
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
      'request_supervision_meter',
      CAST(NEW.Id AS CHAR),
      'UPDATE',
      @app_user_id,
      JSON_OBJECT(
        'Id', OLD.Id,
        'UserId', OLD.UserId,
        'StateRequestId', OLD.StateRequestId
      ),
      JSON_OBJECT(
        'Id', NEW.Id,
        'UserId', NEW.UserId,
        'StateRequestId', NEW.StateRequestId
      ),
      JSON_ARRAY('StateRequestId'),
      CONCAT(
        'Cambio de estado en solicitud de supervision: ',
        COALESCE(CAST(OLD.StateRequestId AS CHAR), 'NULL'),
        ' -> ',
        COALESCE(CAST(NEW.StateRequestId AS CHAR), 'NULL')
      )
    );
  END IF;
END$$

DELIMITER ;
