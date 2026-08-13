-- Migration: tambah kolom archived_at untuk sistem soft-delete backup
-- Kolom ini diisi saat admin mengarsipkan item dari halaman ekspor PDF.
-- Item yang diarsipkan (archived_at IS NOT NULL) disembunyikan dari tampilan publik.
-- Cron job hapus permanen setelah 30 hari.

ALTER TABLE galeri       ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE umkm         ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE produk_hukum ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

-- Index untuk mempercepat query purge cron job
CREATE INDEX IF NOT EXISTS idx_galeri_archived_at       ON galeri(archived_at)       WHERE archived_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_umkm_archived_at         ON umkm(archived_at)         WHERE archived_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_produk_hukum_archived_at ON produk_hukum(archived_at) WHERE archived_at IS NOT NULL;
