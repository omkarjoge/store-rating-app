-- Store Rating Platform - PostgreSQL schema
-- Best practices: normalized tables, FK constraints, CHECK constraints,
-- unique constraints, indexes on frequently filtered/sorted columns.

CREATE TYPE user_role AS ENUM ('ADMIN', 'NORMAL', 'STORE_OWNER');

CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(60)  NOT NULL CHECK (char_length(name) >= 20),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    address         VARCHAR(400) NOT NULL,
    role            user_role NOT NULL DEFAULT 'NORMAL',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_name ON users (name);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- A store is owned by exactly one STORE_OWNER user (nullable in case an
-- owner account is removed in the future; ON DELETE SET NULL preserves history)
CREATE TABLE IF NOT EXISTS stores (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(60)  NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    address         VARCHAR(400) NOT NULL,
    owner_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stores_name ON stores (name);
CREATE INDEX IF NOT EXISTS idx_stores_email ON stores (email);
CREATE INDEX IF NOT EXISTS idx_stores_owner ON stores (owner_id);

-- One rating per (user, store) pair. Users update this row instead of
-- inserting new ratings (enforced by unique constraint + upsert).
CREATE TABLE IF NOT EXISTS ratings (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_id        INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, store_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_store ON ratings (store_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user ON ratings (user_id);

-- keep updated_at fresh
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_stores_updated_at ON stores;
CREATE TRIGGER trg_stores_updated_at BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_ratings_updated_at ON ratings;
CREATE TRIGGER trg_ratings_updated_at BEFORE UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
