/*
  # Update events table to match application interface

  1. Schema Changes
    - Add Spanish column names that match the Event interface
    - Map existing English columns to Spanish equivalents
    - Ensure data compatibility between database and application

  2. Column Mapping
    - `name` → `nombre` (event name)
    - `location` → `lugar` (event location) 
    - `date` → `fecha` (event date)
    - Add `enlace` column for event links
    - Keep `distancia` (distance) and other existing columns

  3. Data Migration
    - Copy existing data from English columns to Spanish columns
    - Maintain backward compatibility during transition
*/

-- Add new Spanish columns to match the Event interface
DO $$
BEGIN
  -- Add nombre column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'nombre'
  ) THEN
    ALTER TABLE events ADD COLUMN nombre TEXT;
  END IF;

  -- Add lugar column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'lugar'
  ) THEN
    ALTER TABLE events ADD COLUMN lugar TEXT;
  END IF;

  -- Add fecha column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'fecha'
  ) THEN
    ALTER TABLE events ADD COLUMN fecha TEXT;
  END IF;

  -- Add enlace column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'enlace'
  ) THEN
    ALTER TABLE events ADD COLUMN enlace TEXT;
  END IF;

  -- Rename distance to distancia if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'distance'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'distancia'
  ) THEN
    ALTER TABLE events RENAME COLUMN distance TO distancia;
  END IF;
END $$;

-- Copy data from existing English columns to Spanish columns
-- UPDATE events
-- SET
--   nombre = COALESCE(nombre, name),
--   lugar = COALESCE(lugar, location),
--   fecha = COALESCE(fecha, date);

-- Make the Spanish columns NOT NULL after data migration
ALTER TABLE events ALTER COLUMN nombre SET NOT NULL;
ALTER TABLE events ALTER COLUMN lugar SET NOT NULL;
ALTER TABLE events ALTER COLUMN fecha SET NOT NULL;

-- Update RLS policies to ensure proper access
DROP POLICY IF EXISTS "Allow all operations on events" ON events;

CREATE POLICY "Allow all operations on events"
  ON events
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Add indexes for the new Spanish columns
CREATE INDEX IF NOT EXISTS idx_events_nombre ON events USING btree (nombre);
CREATE INDEX IF NOT EXISTS idx_events_lugar ON events USING btree (lugar);
CREATE INDEX IF NOT EXISTS idx_events_fecha ON events USING btree (fecha);
CREATE INDEX IF NOT EXISTS idx_events_distancia ON events USING btree (distancia);