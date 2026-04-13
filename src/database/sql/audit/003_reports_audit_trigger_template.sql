/*
  Template para agregar nuevas tablas auditables.
  Ajusta nombre real de la tabla, PK y columnas antes de ejecutarlo.

  Ejemplo en este proyecto:
  - tabla real: reports
  - record_id: NEW.Id / OLD.Id
  - table_name en audit_logs: 'reports'

  Puedes reutilizar el mismo patrón:
  1. AFTER INSERT
  2. AFTER UPDATE
  3. BEFORE DELETE

  Recomendación pragmática:
  - guarda solo columnas útiles para trazabilidad
  - evita hashes, tokens, secretos o blobs grandes
  - calcula changed_fields solo para columnas relevantes
*/
