require('dotenv').config();
const pool = require('./src/config/db');

async function runMigration() {
  try {
    console.log("Menjalankan migrasi database...");
    
    // 1. Rename column id_provinsi to provinsi_id in kabko
    try {
      await pool.query('ALTER TABLE kabko RENAME COLUMN id_provinsi TO provinsi_id;');
      console.log("Berhasil mengubah id_provinsi menjadi provinsi_id di tabel kabko.");
    } catch (err) {
      console.log("Info: kolom id_provinsi mungkin sudah diubah atau tabel tidak ditemukan.");
    }

    // 2. Rename column idkabko to kabko_id in peserta
    try {
      await pool.query('ALTER TABLE peserta RENAME COLUMN idkabko TO kabko_id;');
      console.log("Berhasil mengubah idkabko menjadi kabko_id di tabel peserta.");
    } catch (err) {
      console.log("Info: kolom idkabko mungkin sudah diubah atau tabel tidak ditemukan.");
    }

    console.log("Migrasi selesai!");
  } catch (error) {
    console.error("Gagal menjalankan migrasi:", error);
  } finally {
    pool.end();
  }
}

runMigration();
