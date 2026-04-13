# Auditoria simple con MySQL + triggers

## Flujo

1. Un endpoint autenticado de escritura entra al `AuditActorInterceptor`.
2. El interceptor abre un `QueryRunner`, inicia transaccion y ejecuta `SET @app_user_id = ?`.
3. El controller pasa el `AuditRequestContext` al servicio.
4. El servicio usa el `Repository` ligado al `QueryRunner`.
5. Los triggers MySQL leen `@app_user_id` e insertan el cambio en `audit_logs`.
6. Al terminar la request, el interceptor hace `COMMIT` o `ROLLBACK`, limpia `@app_user_id` y libera la conexion.

## Orden de instalacion

1. Ejecuta [001_create_audit_logs.sql](../src/database/sql/audit/001_create_audit_logs.sql)
2. Ejecuta [002_users_audit_triggers.sql](../src/database/sql/audit/002_users_audit_triggers.sql)
3. Ejecuta [004_user_roles_audit_triggers.sql](../src/database/sql/audit/004_user_roles_audit_triggers.sql)
4. Usa [003_reports_audit_trigger_template.sql](../src/database/sql/audit/003_reports_audit_trigger_template.sql) como base para nuevas tablas

## Endpoints

- `GET /audit/logs`
- `GET /audit/logs/:tableName/:recordId`

Filtros soportados en `GET /audit/logs`:

- `tableName`
- `action`
- `actorUserId`
- `recordId`
- `from`
- `to`
- `page`
- `limit`

## Limite importante

La variable de sesion MySQL solo es confiable si el `SET @app_user_id` y la mutacion usan la misma conexion fisica.

Por eso esta implementacion garantiza actor correcto solo en escrituras que:

- pasan por un endpoint autenticado
- reciben `AuditRequestContext`
- usan el `Repository` del `QueryRunner`

Si otra parte del sistema sigue escribiendo con el `Repository` global de TypeORM, el trigger seguira funcionando, pero `actor_user_id` puede quedar `NULL`.
