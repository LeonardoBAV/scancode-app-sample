import type { SQLiteDatabase, SqliteRow } from '@nativescript-community/sqlite/sqlite.common';

/**
 * Schema revision for `SQLiteDatabase.setVersion`.
 * v1: initial squashed DDL.
 * v2: INTEGER PRIMARY KEY AUTOINCREMENT on pull tables + clients (upgrade path for DBs created before that DDL).
 * v3: UNIQUE indexes on products.sku and products.barcode.
 * v4: orders — ensure is_sync (INTEGER); migrate from legacy synced_at when present.
 * v5: orders — allow NULL payment_method_id.
 * v6: clients — buyer_name, buyer_contact (nullable TEXT).
 * v7: orders — buyer_name, buyer_phone (nullable TEXT).
 * v8: orders.status — CHECK aligned with API enum (pending | completed | cancelled); default pending.
 */
const SCHEMA_VERSION: number = 8;

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
    const startVersion: number = db.getVersion();

    if (startVersion >= SCHEMA_VERSION) {
        return;
    }

    if (startVersion < 1) {
        await migrateToV1(db);
    }

    if (startVersion < 2 && startVersion >= 1) {
        await migrateToV2AutoincrementPullTables(db);
    }

    if (startVersion < 3) {
        await migrateToV3ProductsSkuBarcodeUnique(db);
    }

    if (startVersion < 4) {
        await migrateToV4OrdersIsSyncColumn(db);
    }

    if (startVersion < 5) {
        await migrateToV5OrdersNullablePaymentMethod(db);
    }

    if (startVersion < 6) {
        await migrateToV6ClientsBuyerFields(db);
    }

    if (startVersion < 7) {
        await migrateToV7OrdersBuyerFields(db);
    }

    if (startVersion < 8) {
        await migrateToV8OrdersStatusCheck(db);
    }

    await db.setVersion(SCHEMA_VERSION);
}

/** Creates the full database schema (squashed from former v1–v8). */
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
            status                    TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
            notes                     TEXT,
            buyer_name                TEXT,
            buyer_phone               TEXT,
            client_id                 INTEGER NOT NULL REFERENCES clients(id),
            sales_representative_id   INTEGER NOT NULL,
            payment_method_id         INTEGER REFERENCES payment_methods(id),
            is_sync                   INTEGER NOT NULL DEFAULT 0,
            created_at                TEXT    NOT NULL,
            updated_at                TEXT    NOT NULL
        );
    `);
    await db.execute('CREATE INDEX IF NOT EXISTS idx_orders_event_id ON orders(event_id);');

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
}

/**
 * Upgrades databases created at schema v1 (INTEGER PRIMARY KEY without AUTOINCREMENT keyword).
 * Preserves `id` values and FK integrity; recreates indexes.
 */
async function migrateToV2AutoincrementPullTables(db: SQLiteDatabase): Promise<void> {
    await db.execute('PRAGMA foreign_keys = OFF;');

    await db.transaction(async () => {
        await db.execute(`
            CREATE TABLE product_categories__ac (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                remote_id   INTEGER,
                is_sync     INTEGER NOT NULL DEFAULT 0,
                name        TEXT    NOT NULL,
                created_at  TEXT    NOT NULL DEFAULT '',
                updated_at  TEXT    NOT NULL
            );
        `);
        await db.execute('INSERT INTO product_categories__ac SELECT * FROM product_categories;');
        await db.execute('DROP TABLE product_categories;');
        await db.execute('ALTER TABLE product_categories__ac RENAME TO product_categories;');

        await db.execute(`
            CREATE TABLE products__ac (
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
        await db.execute('INSERT INTO products__ac SELECT * FROM products;');
        await db.execute('DROP TABLE products;');
        await db.execute('ALTER TABLE products__ac RENAME TO products;');
        await db.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON products(sku);');
        await db.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);');
        await db.execute('CREATE INDEX IF NOT EXISTS idx_products_category ON products(product_category_id);');

        await db.execute(`
            CREATE TABLE clients__ac (
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
                updated_at       TEXT    NOT NULL
            );
        `);
        await db.execute(`
            INSERT INTO clients__ac (
                id, remote_id, is_sync, cpf_cnpj, corporate_name, fantasy_name, email, phone, carrier,
                buyer_name, buyer_contact, created_at, updated_at
            )
            SELECT
                id, remote_id, is_sync, cpf_cnpj, corporate_name, fantasy_name, email, phone, carrier,
                NULL, NULL, created_at, updated_at
            FROM clients;
        `);
        await db.execute('DROP TABLE clients;');
        await db.execute('ALTER TABLE clients__ac RENAME TO clients;');
        await db.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_cpf_cnpj ON clients(cpf_cnpj);');
        await db.execute('CREATE INDEX IF NOT EXISTS idx_clients_corporate_name ON clients(corporate_name);');

        await db.execute(`
            CREATE TABLE payment_methods__ac (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                remote_id   INTEGER,
                is_sync     INTEGER NOT NULL DEFAULT 0,
                name        TEXT    NOT NULL,
                created_at  TEXT    NOT NULL DEFAULT '',
                updated_at  TEXT    NOT NULL
            );
        `);
        await db.execute('INSERT INTO payment_methods__ac SELECT * FROM payment_methods;');
        await db.execute('DROP TABLE payment_methods;');
        await db.execute('ALTER TABLE payment_methods__ac RENAME TO payment_methods;');

        await db.execute(`
            CREATE TABLE events__ac (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                remote_id   INTEGER,
                is_sync     INTEGER NOT NULL DEFAULT 0,
                name        TEXT    NOT NULL,
                start       TEXT    NOT NULL,
                end         TEXT    NOT NULL,
                created_at  TEXT    NOT NULL,
                updated_at  TEXT    NOT NULL
            );
        `);
        await db.execute('INSERT INTO events__ac SELECT * FROM events;');
        await db.execute('DROP TABLE events;');
        await db.execute('ALTER TABLE events__ac RENAME TO events;');
        await db.execute('CREATE INDEX IF NOT EXISTS idx_events_start ON events(start);');
    });

    await db.execute('PRAGMA foreign_keys = ON;');
}

/** Replaces non-unique sku/barcode indexes with UNIQUE (existing v2 DBs). */
async function migrateToV3ProductsSkuBarcodeUnique(db: SQLiteDatabase): Promise<void> {
    await db.execute('DROP INDEX IF EXISTS idx_products_sku;');
    await db.execute('DROP INDEX IF EXISTS idx_products_barcode;');
    await db.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON products(sku);');
    await db.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);');
}

/**
 * Ensures `orders` has `is_sync INTEGER` (replacing legacy `synced_at TEXT` when present).
 * - DBs created by current `migrateToV1` already have `is_sync` and no `synced_at`: no-op.
 * - Older DBs with `synced_at`: table rebuild + copy `is_sync` from non-null `synced_at`.
 * - Rare broken shapes without either column: `ALTER TABLE ... ADD COLUMN is_sync`.
 */
async function migrateToV4OrdersIsSyncColumn(db: SQLiteDatabase): Promise<void> {
    const columns = await db.select('PRAGMA table_info(orders)');
    if (columns.length === 0) {
        return;
    }

    const columnNames = new Set(columns.map((row: SqliteRow) => String(row.name)));
    if (columnNames.has('is_sync')) {
        return;
    }

    if (!columnNames.has('synced_at')) {
        await db.execute('ALTER TABLE orders ADD COLUMN is_sync INTEGER NOT NULL DEFAULT 0');
        return;
    }

    await db.execute('PRAGMA foreign_keys = OFF;');

    await db.transaction(async () => {
        await db.execute(`
            CREATE TABLE orders__v4 (
                id                        INTEGER PRIMARY KEY AUTOINCREMENT,
                remote_id                 INTEGER UNIQUE,
                event_id                  INTEGER NOT NULL REFERENCES events(id),
                status                    TEXT    NOT NULL DEFAULT 'Pending',
                notes                     TEXT,
                client_id                 INTEGER NOT NULL REFERENCES clients(id),
                sales_representative_id   INTEGER NOT NULL,
                payment_method_id         INTEGER REFERENCES payment_methods(id),
                is_sync                   INTEGER NOT NULL DEFAULT 0,
                created_at                TEXT    NOT NULL,
                updated_at                TEXT    NOT NULL
            );
        `);

        await db.execute(`
            INSERT INTO orders__v4
                (id, remote_id, event_id, status, notes, client_id,
                 sales_representative_id, payment_method_id, is_sync, created_at, updated_at)
            SELECT id, remote_id, event_id, status, notes, client_id,
                   sales_representative_id, payment_method_id,
                   CASE WHEN synced_at IS NOT NULL THEN 1 ELSE 0 END,
                   created_at, updated_at
            FROM orders;
        `);

        await db.execute('DROP TABLE orders;');
        await db.execute('ALTER TABLE orders__v4 RENAME TO orders;');
        await db.execute('CREATE INDEX IF NOT EXISTS idx_orders_event_id ON orders(event_id);');
    });

    await db.execute('PRAGMA foreign_keys = ON;');
}

/**
 * Allows `orders.payment_method_id` to be NULL (removes NOT NULL constraint).
 * SQLite requires a table rebuild to change column constraints.
 */
async function migrateToV5OrdersNullablePaymentMethod(db: SQLiteDatabase): Promise<void> {
    const columns = await db.select('PRAGMA table_info(orders)');
    if (columns.length === 0) {
        return;
    }

    const columnNames = new Set(columns.map((row: SqliteRow) => String(row.name)));
    if (!columnNames.has('payment_method_id')) {
        return;
    }

    await db.execute('PRAGMA foreign_keys = OFF;');

    await db.transaction(async () => {
        await db.execute(`
            CREATE TABLE orders__v5 (
                id                        INTEGER PRIMARY KEY AUTOINCREMENT,
                remote_id                 INTEGER UNIQUE,
                event_id                  INTEGER NOT NULL REFERENCES events(id),
                status                    TEXT    NOT NULL DEFAULT 'Pending',
                notes                     TEXT,
                client_id                 INTEGER NOT NULL REFERENCES clients(id),
                sales_representative_id   INTEGER NOT NULL,
                payment_method_id         INTEGER REFERENCES payment_methods(id),
                is_sync                   INTEGER NOT NULL DEFAULT 0,
                created_at                TEXT    NOT NULL,
                updated_at                TEXT    NOT NULL
            );
        `);

        await db.execute(`
            INSERT INTO orders__v5
                (id, remote_id, event_id, status, notes, client_id,
                 sales_representative_id, payment_method_id, is_sync, created_at, updated_at)
            SELECT id, remote_id, event_id, status, notes, client_id,
                   sales_representative_id, payment_method_id, is_sync, created_at, updated_at
            FROM orders;
        `);

        await db.execute('DROP TABLE orders;');
        await db.execute('ALTER TABLE orders__v5 RENAME TO orders;');
        await db.execute('CREATE INDEX IF NOT EXISTS idx_orders_event_id ON orders(event_id);');
    });

    await db.execute('PRAGMA foreign_keys = ON;');
}

/** Adds nullable buyer fields on clients (API-aligned). */
async function migrateToV6ClientsBuyerFields(db: SQLiteDatabase): Promise<void> {
    const columns = await db.select('PRAGMA table_info(clients)');
    if (columns.length === 0) {
        return;
    }

    const columnNames = new Set(columns.map((row: SqliteRow) => String(row.name)));
    if (!columnNames.has('buyer_name')) {
        await db.execute('ALTER TABLE clients ADD COLUMN buyer_name TEXT');
    }
    if (!columnNames.has('buyer_contact')) {
        await db.execute('ALTER TABLE clients ADD COLUMN buyer_contact TEXT');
    }
}

/** Adds nullable buyer fields on orders (API-aligned). */
async function migrateToV7OrdersBuyerFields(db: SQLiteDatabase): Promise<void> {
    const columns = await db.select('PRAGMA table_info(orders)');
    if (columns.length === 0) {
        return;
    }

    const columnNames = new Set(columns.map((row: SqliteRow) => String(row.name)));
    if (!columnNames.has('buyer_name')) {
        await db.execute('ALTER TABLE orders ADD COLUMN buyer_name TEXT');
    }
    if (!columnNames.has('buyer_phone')) {
        await db.execute('ALTER TABLE orders ADD COLUMN buyer_phone TEXT');
    }
}

/**
 * Restricts `orders.status` to API enum values via CHECK; default `pending`.
 * Coerces legacy status strings in the INSERT so typical dev DBs (e.g. Open / Pending) still upgrade.
 */
async function migrateToV8OrdersStatusCheck(db: SQLiteDatabase): Promise<void> {
    const columns = await db.select('PRAGMA table_info(orders)');
    if (columns.length === 0) {
        return;
    }

    await db.execute('PRAGMA foreign_keys = OFF;');

    await db.transaction(async () => {
        await db.execute(`
            CREATE TABLE orders__v8 (
                id                        INTEGER PRIMARY KEY AUTOINCREMENT,
                remote_id                 INTEGER UNIQUE,
                event_id                  INTEGER NOT NULL REFERENCES events(id),
                status                    TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
                notes                     TEXT,
                buyer_name                TEXT,
                buyer_phone               TEXT,
                client_id                 INTEGER NOT NULL REFERENCES clients(id),
                sales_representative_id   INTEGER NOT NULL,
                payment_method_id         INTEGER REFERENCES payment_methods(id),
                is_sync                   INTEGER NOT NULL DEFAULT 0,
                created_at                TEXT    NOT NULL,
                updated_at                TEXT    NOT NULL
            );
        `);

        await db.execute(`
            INSERT INTO orders__v8 (
                id, remote_id, event_id, status, notes, buyer_name, buyer_phone,
                client_id, sales_representative_id, payment_method_id, is_sync, created_at, updated_at
            )
            SELECT
                id,
                remote_id,
                event_id,
                CASE lower(trim(ifnull(status, '')))
                    WHEN 'open' THEN 'pending'
                    WHEN 'aberto' THEN 'pending'
                    WHEN 'pending' THEN 'pending'
                    WHEN 'closed' THEN 'completed'
                    WHEN 'fechado' THEN 'completed'
                    WHEN 'completed' THEN 'completed'
                    WHEN 'canceled' THEN 'cancelled'
                    WHEN 'cancelled' THEN 'cancelled'
                    WHEN 'cancelado' THEN 'cancelled'
                    ELSE 'pending'
                END,
                notes,
                buyer_name,
                buyer_phone,
                client_id,
                sales_representative_id,
                payment_method_id,
                is_sync,
                created_at,
                updated_at
            FROM orders;
        `);

        await db.execute('DROP TABLE orders;');
        await db.execute('ALTER TABLE orders__v8 RENAME TO orders;');
        await db.execute('CREATE INDEX IF NOT EXISTS idx_orders_event_id ON orders(event_id);');
    });

    await db.execute('PRAGMA foreign_keys = ON;');
}
