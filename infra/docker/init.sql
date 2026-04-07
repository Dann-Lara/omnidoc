-- Extensiones necesarias para Supabase Auth
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vault";

-- Configuración adicional para Auth
-- GoTrue espera que estas tablas existan
CREATE SCHEMA IF NOT EXISTS auth;
