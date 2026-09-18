-- Extension de la hierarchie des roles: USER -> MEMBER, ajout de GUEST et SUPERADMIN.
-- Migration non destructive: on renomme la valeur existante puis on ajoute les nouvelles.

ALTER TYPE "Role" RENAME VALUE 'USER' TO 'MEMBER';

ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'GUEST';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPERADMIN';

ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
