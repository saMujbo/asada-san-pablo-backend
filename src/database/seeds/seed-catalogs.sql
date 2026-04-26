-- ==========================================
-- SEEDS ASADA SAN PABLO
-- MySQL — INSERT IGNORE (idempotente)
-- ==========================================

-- roles
INSERT IGNORE INTO `role` (`Rolname`, `Description`) VALUES
  ('ADMIN',     'Acceso administrativo completo al sistema.'),
  ('INVITADO',  'Rol por defecto con acceso limitado.'),
  ('JUNTA',     'Acceso para miembros de la Junta Directiva.'),
  ('ABONADO',   'Acceso para abonados del sistema.'),
  ('ASOCIADO',  'Acceso para asociados del sistema.'),
  ('FONTANERO', 'Acceso para fontaneros.');

-- report_types
INSERT IGNORE INTO `report_types` (`Name`) VALUES
  ('FUGA'),
  ('SIN SERVICIO'),
  ('MEDIDOR'),
  ('CALIDAD DEL AGUA'),
  ('CONEXION ILEGAL'),
  ('OTROS');

-- report_states
INSERT IGNORE INTO `report_states` (`Name`, `IsActive`) VALUES
  ('Pendiente',  1),
  ('En Proceso', 1),
  ('Resuelto',   1);

-- state_request
INSERT IGNORE INTO `state_request` (`Name`, `Description`, `IsActive`) VALUES
  ('PENDIENTE',   'Solicitud recibida y pendiente de revision.',                        1),
  ('EN REVISION', 'Solicitud en proceso de analisis administrativo.',                   1),
  ('APROBADA',    'Solicitud aprobada por la ASADA.',                                   1),
  ('RECHAZADA',   'Solicitud rechazada por incumplimiento o resolucion administrativa.', 1);

-- project_state
INSERT IGNORE INTO `project_state` (`Name`, `Description`, `IsActive`) VALUES
  ('PENDIENTE',  'Proyecto creado pero aun no iniciado.',      1),
  ('EN PROCESO', 'Proyecto en ejecucion.',                    1),
  ('FINALIZADO', 'Proyecto concluido satisfactoriamente.',     1),
  ('CANCELADO',  'Proyecto cancelado antes de su finalizacion.', 1);
