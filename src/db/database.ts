import * as SQLite from "expo-sqlite";

const NAMA_DATABASE = "jelajah-aman.db";
// 1. Ubah VERSI_DATABASE menjadi 2
const VERSI_DATABASE = 2;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function migrasiDatabase(db: SQLite.SQLiteDatabase) {
  const baris = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version"
  );
  let versiSaatIni = baris?.user_version ?? 0;

  if (versiSaatIni >= VERSI_DATABASE) return;

  if (versiSaatIni < 1) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      CREATE TABLE IF NOT EXISTS cache_cuaca (
        kunci TEXT PRIMARY KEY NOT NULL,
        kota_id INTEGER NOT NULL,
        nama_kota TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        cuaca_json TEXT NOT NULL,
        aqi_json TEXT NOT NULL,
        disimpan_pada INTEGER NOT NULL
      );
    `);
    versiSaatIni = 1;
  }

  // 2. Blok Migrasi Versi 2 (Ditambahkan TEPAT SEBELUM PRAGMA user_version)
  if (versiSaatIni < 2) {
    await db.execAsync(
      "ALTER TABLE cache_cuaca ADD COLUMN jumlah_dibuka INTEGER NOT NULL DEFAULT 0;"
    );
    versiSaatIni = 2;
  }

  await db.execAsync(`PRAGMA user_version = ${VERSI_DATABASE};`);
}

export async function ambilDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(NAMA_DATABASE).then(async (db) => {
      await migrasiDatabase(db);
      return db;
    });
  }
  return dbPromise;
}