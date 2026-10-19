import * as SQLite from "expo-sqlite";

const NAMA_DATABASE = "jelajah-aman.db";
const VERSI_DATABASE = 1;

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