import type { SQLiteDatabase } from '@nativescript-community/sqlite';

const SCHEMA_VERSION: number = 2;

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
    const currentVersion: number = db.getVersion();

    if (currentVersion >= SCHEMA_VERSION) {
        return;
    }

    if (currentVersion < 1) {
        await migrateToV1(db);
    }

    if (currentVersion < 2) {
        await migrateToV2(db);
    }

    await db.setVersion(SCHEMA_VERSION);
}

async function migrateToV1(db: SQLiteDatabase): Promise<void> {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS events (
            id          INTEGER PRIMARY KEY,
            name        TEXT    NOT NULL,
            start       TEXT    NOT NULL,
            end         TEXT    NOT NULL,
            created_at  TEXT    NOT NULL,
            updated_at  TEXT    NOT NULL
        );
    `);
    await db.execute('CREATE INDEX IF NOT EXISTS idx_events_start ON events(start);');

    await db.execute(`
        CREATE TABLE IF NOT EXISTS product_categories (
            id          INTEGER PRIMARY KEY,
            name        TEXT    NOT NULL,
            updated_at  TEXT    NOT NULL
        );
    `);

    await db.execute(`
        CREATE TABLE IF NOT EXISTS products (
            id                   INTEGER PRIMARY KEY,
            sku                  TEXT    NOT NULL,
            barcode              TEXT,
            name                 TEXT    NOT NULL,
            price                REAL    NOT NULL,
            product_category_id  INTEGER NOT NULL REFERENCES product_categories(id),
            updated_at           TEXT    NOT NULL
        );
    `);
    await db.execute('CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_products_category ON products(product_category_id);');

    await db.execute(`
        CREATE TABLE IF NOT EXISTS clients (
            id              INTEGER PRIMARY KEY,
            cpf_cnpj        TEXT    NOT NULL,
            corporate_name  TEXT    NOT NULL,
            fantasy_name    TEXT,
            email           TEXT,
            phone           TEXT,
            carrier         TEXT,
            updated_at      TEXT    NOT NULL
        );
    `);
    await db.execute('CREATE INDEX IF NOT EXISTS idx_clients_cpf_cnpj ON clients(cpf_cnpj);');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_clients_corporate_name ON clients(corporate_name);');

    await db.execute(`
        CREATE TABLE IF NOT EXISTS payment_methods (
            id          INTEGER PRIMARY KEY,
            name        TEXT    NOT NULL,
            updated_at  TEXT    NOT NULL
        );
    `);

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
            payment_method_id         INTEGER NOT NULL,
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
            event_id                  INTEGER NOT NULL REFERENCES events(id),
            status                    TEXT    NOT NULL DEFAULT 'Pending',
            notes                     TEXT,
            client_id                 INTEGER NOT NULL REFERENCES clients(id),
            sales_representative_id   INTEGER NOT NULL,
            payment_method_id         INTEGER NOT NULL REFERENCES payment_methods(id),
            synced_at                 TEXT,
            created_at                TEXT    NOT NULL,
            updated_at                TEXT    NOT NULL
        );
    `);
    await db.execute('CREATE INDEX IF NOT EXISTS idx_orders_event_id ON orders(event_id);');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_orders_synced_at ON orders(synced_at);');

    await db.execute(`
        CREATE TABLE IF NOT EXISTS order_items (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            product_id  INTEGER NOT NULL REFERENCES products(id),
            price       REAL    NOT NULL,
            qty         INTEGER NOT NULL,
            notes       TEXT
        );
    `);
    await db.execute('CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);');

    await db.execute(`
        CREATE TABLE IF NOT EXISTS sync_log (
            entity      TEXT    PRIMARY KEY,
            pulled_at   TEXT    NOT NULL
        );
    `);
}

async function migrateToV2(db: SQLiteDatabase): Promise<void> {
    await db.execute(`
        ALTER TABLE clients ADD COLUMN created_at TEXT NOT NULL DEFAULT '';
    `);
}
