-- ============================================================
-- ANITA FESTIVAL - Configuración de Supabase para Tiempo Real
-- ============================================================
-- Ejecutar este SQL en el Editor SQL de Supabase para habilitar
-- la sincronización multicliente en tiempo real.
--
-- Sin este script, la app funciona 100% en local (localStorage).
-- ============================================================

-- 1. Tabla principal de estado del festival
--    Cada fila representa un "dominio" de estado (bingo, chat, etc.)
CREATE TABLE IF NOT EXISTS festival_state (
  id TEXT PRIMARY KEY,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE festival_state ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de acceso público (la app no maneja auth propia)
--    Lectura pública: cualquiera puede leer el estado
CREATE POLICY "Lectura pública"
  ON festival_state
  FOR SELECT
  USING (true);

--    Escritura pública: cualquiera puede crear filas
CREATE POLICY "Escritura pública"
  ON festival_state
  FOR INSERT
  WITH CHECK (true);

--    Actualización pública: cualquiera puede actualizar filas
CREATE POLICY "Actualización pública"
  ON festival_state
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 4. Habilitar Realtime en la tabla
--    Esto permite que los clientes reciban cambios en tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE festival_state;

-- 5. Índice para consultas eficientes por fecha de actualización
CREATE INDEX IF NOT EXISTS idx_festival_state_updated
  ON festival_state(updated_at DESC);

-- 6. (Opcional) Función para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_festival_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_festival_state_updated
  BEFORE UPDATE ON festival_state
  FOR EACH ROW
  EXECUTE FUNCTION update_festival_timestamp();

-- ============================================================
-- NOTAS DE USO:
-- ============================================================
-- - La app usa la fila con id 'bingo_shared_state' para el bingo
-- - La app usa la fila con id 'anita_room_state' para la sala
-- - La app usa la fila con id 'anita_avatars' para avatares
-- - La app usa la fila con id 'anita_stats' para estadísticas
--
-- Para verificar que Realtime está activo:
--   SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
-- ============================================================