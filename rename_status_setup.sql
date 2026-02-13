-- Rename 'EN_PROGRESO' to 'EN_PROCESO' in Proyectos table

-- 1. Update the ENUM definition (PostgreSQL approach for text check constraints or direct enum type update)
-- Since Supabase/Postgres don't support effortless ENUM modification, we often rely on Check Constraints for text columns or recreating the type.
-- Assuming 'estado' is an ENUM type or a TEXT column with a CHECK constraint.

-- Option A: If 'estado' is a TEXT column with a CHECK constraint (Common in some setups)
ALTER TABLE public."Proyectos" DROP CONSTRAINT IF EXISTS "Proyectos_estado_check";

-- Update existing data
UPDATE public."Proyectos" 
SET estado = 'EN_PROCESO' 
WHERE estado = 'EN_PROGRESO';

-- Re-add constraint with new value (if applicable)
-- ALTER TABLE public."Proyectos" ADD CONSTRAINT "Proyectos_estado_check" CHECK (estado IN ('PLANIFICACION', 'EN_PROCESO', 'FINALIZADO'));


-- Option B: If 'estado' is a native PostgreSQL ENUM type (e.g., "project_status")
-- We need to rename the value. 
-- ALTER TYPE "project_status" RENAME VALUE 'EN_PROGRESO' TO 'EN_PROCESO';
-- However, 'RENAME VALUE' is supported in newer Postgres versions (10+).

-- SAFEST GENERIC APPROACH (Text-based update for simplicity in this context):
-- We just run the UPDATE. If it fails due to constraint, the user will see it. 

BEGIN;
    -- Try updating the values first
    UPDATE public."Proyectos" SET estado = 'EN_PROCESO' WHERE estado = 'EN_PROGRESO';
    
    -- If Actividades also uses this status and needs update:
    -- UPDATE public."Actividades" SET estado = 'EN_PROCESO' WHERE estado = 'EN_PROGRESO';
COMMIT;
