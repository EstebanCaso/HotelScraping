-- Agrega restricción UNIQUE para evitar eventos duplicados por enlace
ALTER TABLE events
  ADD CONSTRAINT unique_event_enlace UNIQUE (enlace);

-- Si el enlace es NULL, evitar duplicados por combinación de nombre, fecha y lugar
CREATE UNIQUE INDEX IF NOT EXISTS unique_event_nofk ON events (nombre, fecha, lugar)
  WHERE enlace IS NULL; 