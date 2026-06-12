import type { SQLiteDatabase } from '@nativescript-community/sqlite/sqlite.common';

/**
 * Schema revision for `SQLiteDatabase.setVersion`.
 * Squashed base DDL (`migrateToV1`) plus forward-only deltas for installed databases.
 *
 * **Legacy:** If a device still has `user_version` above the current schema from an older
 * incremental series, this file is skipped. Clear app data or delete the SQLite file before
 * relying on a clean install with this revision.
 */
const SCHEMA_VERSION: number = 3;

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
    const startVersion: number = db.getVersion();

    if (startVersion >= SCHEMA_VERSION) {
        return;
    }

    if (startVersion < 1) {
        await migrateToV1(db);
    } else {
        if (startVersion < 2) {
            await migrateToV2(db);
        }

        if (startVersion < 3) {
            await migrateToV3(db);
        }
    }

    await db.setVersion(SCHEMA_VERSION);
}

/** Full operational schema (single migration). */
async function migrateToV1(db: SQLiteDatabase): Promise<void> {
    await db.execute('DROP TABLE IF EXISTS sync_log;');

    await db.execute(`
        CREATE TABLE IF NOT EXISTS product_categories (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            remote_id   INTEGER,
            is_sync     INTEGER NOT NULL DEFAULT 0,
            name        TEXT    NOT NULL,
            created_at  TEXT    NOT NULL DEFAULT '',
            updated_at  TEXT    NOT NULL
        );
    `);

    await db.execute(`
        CREATE TABLE IF NOT EXISTS products (
            id                   INTEGER PRIMARY KEY AUTOINCREMENT,
            remote_id            INTEGER,
            is_sync              INTEGER NOT NULL DEFAULT 0,
            sku                  TEXT    NOT NULL,
            barcode              TEXT,
            name                 TEXT    NOT NULL,
            price                REAL    NOT NULL,
            product_category_id  INTEGER NOT NULL REFERENCES product_categories(id),
            created_at           TEXT    NOT NULL DEFAULT '',
            updated_at           TEXT    NOT NULL
        );
    `);
    await db.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON products(sku);');
    await db.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_products_category ON products(product_category_id);');

    await db.execute(`
        CREATE TABLE IF NOT EXISTS clients (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            remote_id        INTEGER,
            is_sync          INTEGER NOT NULL DEFAULT 0,
            cpf_cnpj         TEXT    NOT NULL,
            corporate_name   TEXT    NOT NULL,
            fantasy_name     TEXT,
            email            TEXT,
            phone            TEXT,
            carrier          TEXT,
            buyer_name       TEXT,
            buyer_contact    TEXT,
            created_at       TEXT    NOT NULL DEFAULT '',
            updated_at      TEXT    NOT NULL
        );
    `);
    await db.execute('CREATE UNIQUE INDEX idx_clients_cpf_cnpj ON clients(cpf_cnpj);');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_clients_corporate_name ON clients(corporate_name);');

    await db.execute(`
        CREATE TABLE IF NOT EXISTS payment_methods (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            remote_id   INTEGER,
            is_sync     INTEGER NOT NULL DEFAULT 0,
            name        TEXT    NOT NULL,
            created_at  TEXT    NOT NULL DEFAULT '',
            updated_at  TEXT    NOT NULL
        );
    `);

    await db.execute(`
        CREATE TABLE IF NOT EXISTS events (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            remote_id   INTEGER,
            is_sync     INTEGER NOT NULL DEFAULT 0,
            name        TEXT    NOT NULL,
            start       TEXT    NOT NULL,
            end         TEXT    NOT NULL,
            has_stock_limit  INTEGER NOT NULL DEFAULT 0,
            created_at  TEXT    NOT NULL,
            updated_at  TEXT    NOT NULL
        );
    `);
    await db.execute('CREATE INDEX IF NOT EXISTS idx_events_start ON events(start);');

    await db.execute(`
        CREATE TABLE IF NOT EXISTS orders_backup (
            backup_id                 INTEGER PRIMARY KEY AUTOINCREMENT,
            backed_up_at              TEXT    NOT NULL,
            reason                    TEXT    NOT NULL DEFAULT 'pre_login_unsynced',
            id                        INTEGER NOT NULL,
            remote_id                 INTEGER,
            event_id                  INTEGER NOT NULL,
            status                    TEXT    NOT NULL,
            notes                     TEXT,
            client_id                 INTEGER NOT NULL,
            sales_representative_id   INTEGER NOT NULL,
            payment_method_id         INTEGER REFERENCES payment_methods(id),
            synced_at                 TEXT,
            created_at                TEXT    NOT NULL,
            updated_at                TEXT    NOT NULL
        );
    `);

    await db.execute(`
        CREATE TABLE IF NOT EXISTS order_items_backup (
            backup_id     INTEGER PRIMARY KEY AUTOINCREMENT,
            backed_up_at  TEXT    NOT NULL,
            order_id      INTEGER NOT NULL,
            id            INTEGER NOT NULL,
            movement      TEXT,
            product_id    INTEGER NOT NULL,
            price         REAL    NOT NULL,
            qty           INTEGER NOT NULL,
            notes         TEXT
        );
    `);

    await db.execute(`
        CREATE TABLE IF NOT EXISTS orders (
            id                        INTEGER PRIMARY KEY AUTOINCREMENT,
            remote_id                 INTEGER UNIQUE,
            event_id                  INTEGER NOT NULL REFERENCES events(id) ON UPDATE CASCADE ON DELETE RESTRICT,
            status                    TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
            notes                     TEXT,
            buyer_name                TEXT,
            buyer_phone               TEXT,
            client_id                 INTEGER NOT NULL REFERENCES clients(id) ON UPDATE CASCADE ON DELETE RESTRICT,
            sales_representative_id   INTEGER NOT NULL,
            payment_method_id         INTEGER REFERENCES payment_methods(id) ON UPDATE CASCADE ON DELETE RESTRICT,
            is_sync                   INTEGER NOT NULL DEFAULT 0,
            created_at                TEXT    NOT NULL,
            updated_at                TEXT    NOT NULL
        );
    `);
    await db.execute('CREATE INDEX IF NOT EXISTS idx_orders_event_id ON orders(event_id);');

    await db.execute(`
        CREATE TABLE IF NOT EXISTS order_items (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            movement    TEXT,
            order_id    INTEGER NOT NULL REFERENCES orders(id) ON UPDATE CASCADE ON DELETE CASCADE,
            product_id  INTEGER NOT NULL REFERENCES products(id) ON UPDATE CASCADE ON DELETE RESTRICT,
            price       REAL    NOT NULL,
            qty         INTEGER NOT NULL,
            notes       TEXT
        );
    `);
    await db.execute('CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);');
}

/** Adds stock-limit metadata for events synced from Scancode. */
async function migrateToV2(db: SQLiteDatabase): Promise<void> {
    await db.execute('ALTER TABLE events ADD COLUMN has_stock_limit INTEGER NOT NULL DEFAULT 0;');
}

/** Adds the stock movement UUID tracked by Scancode Desktop. */
async function migrateToV3(db: SQLiteDatabase): Promise<void> {
    await db.execute('ALTER TABLE order_items ADD COLUMN movement TEXT;');
    await db.execute('ALTER TABLE order_items_backup ADD COLUMN movement TEXT;');
}
