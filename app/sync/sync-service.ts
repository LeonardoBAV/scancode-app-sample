import type { SQLiteDatabase } from '@nativescript-community/sqlite';

import { initDatabase, getDatabase } from '../db/database';
import { pullFullAfterLogin } from './pull';

export async function syncAfterLogin(): Promise<void> {
    await initDatabase();
    await wipeOperationalTables();
    await pullFullAfterLogin();
}

async function wipeOperationalTables(): Promise<void> {
    const db: SQLiteDatabase = getDatabase();

    await db.execute('DELETE FROM order_items');
    await db.execute('DELETE FROM orders');
    await db.execute('DELETE FROM products');
    await db.execute('DELETE FROM product_categories');
    await db.execute('DELETE FROM clients');
    await db.execute('DELETE FROM payment_methods');
    await db.execute('DELETE FROM events');
    await db.execute('DELETE FROM sync_log');
}
