-- =====================================================================
--  Student Hub & Internship Logbook — Supabase schema
--  Run this whole file once in the Supabase SQL Editor.
--
--  Source of truth for the four core tables: QOL/README.md (lines 53-107).
--  Every column marked "EXTENSION" is additive and required by a feature
--  described in the module docs but absent from the README schema.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. profiles
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    nama_lengkap VARCHAR(255) NOT NULL,
    nim VARCHAR(50) NOT NULL,
    prodi VARCHAR(100) DEFAULT 'Teknik Informatika',
    instansi VARCHAR(255) DEFAULT 'Sekolah Tinggi Teknologi Bontang',
    tempat_kp VARCHAR(255) DEFAULT 'PT Badak NGL',
    email VARCHAR(255) UNIQUE NOT NULL,
    -- EXTENSION: signature block of Formulir 2 (modul-logbook/02) + recap period (modul-task-report/03)
    pembimbing_nama VARCHAR(255),
    pembimbing_jabatan VARCHAR(255),
    lokasi_ttd VARCHAR(120) DEFAULT 'Bontang',
    periode_mulai DATE,
    periode_selesai DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ---------------------------------------------------------------------
-- 2. skm_activities
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS skm_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    judul VARCHAR(255) NOT NULL,
    kategori VARCHAR(100) NOT NULL,
    penyelenggara VARCHAR(255) NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE,
    poin_skm INT DEFAULT 0,
    deskripsi TEXT,
    skill_tags TEXT[],
    certificate_url TEXT,
    -- EXTENSION: "Credential ID" line of the LinkedIn certification format (modul-skm/03)
    credential_id VARCHAR(120),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS skm_activities_user_idx ON skm_activities (user_id, tanggal_mulai DESC);

-- ---------------------------------------------------------------------
-- 3. internship_reports
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS internship_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    jam_mulai TIME,
    jam_selesai TIME,
    kategori VARCHAR(100) NOT NULL,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    output TEXT,
    kendala TEXT,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS internship_reports_user_idx ON internship_reports (user_id, tanggal DESC);
CREATE INDEX IF NOT EXISTS internship_reports_tanggal_idx ON internship_reports (tanggal DESC);

-- ---------------------------------------------------------------------
-- 4. report_comments   (EXTENSION)
--    Comment / feedback thread on a report — mirrors the reference app
--    and backs the "sertakan komentar" export toggle.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS report_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID REFERENCES internship_reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    isi TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS report_comments_report_idx ON report_comments (report_id, created_at);

-- ---------------------------------------------------------------------
-- 5. supervisors   (EXTENSION)
--    Multi-supervisor consultation tracking — modul-logbook/03.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS supervisors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    nama VARCHAR(255) NOT NULL,
    jabatan VARCHAR(255),
    departemen VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS supervisors_user_idx ON supervisors (user_id, nama);

-- ---------------------------------------------------------------------
-- 6. logbook_entries
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS logbook_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    nomor_urut INT NOT NULL,
    tanggal DATE NOT NULL,
    aktivitas_pekerjaan TEXT NOT NULL,
    pembimbing_nama VARCHAR(255) NOT NULL,
    pembimbing_jabatan VARCHAR(255),
    paraf_status BOOLEAN DEFAULT FALSE,
    -- EXTENSION: supervisor picker + per-supervisor recap (modul-logbook/03).
    -- pembimbing_nama / pembimbing_jabatan stay denormalised so an already
    -- printed Formulir 2 keeps its wording if a supervisor record is edited.
    supervisor_id UUID REFERENCES supervisors(id) ON DELETE SET NULL,
    -- EXTENSION: "Hasil & Tindak Lanjut" (modul-logbook/03)
    hasil_tindak_lanjut TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS logbook_entries_user_idx ON logbook_entries (user_id, nomor_urut);

-- ---------------------------------------------------------------------
-- 7. Integrity constraints   (EXTENSION — audit P0-3)
--    ADD CONSTRAINT has no IF NOT EXISTS, so guard via pg_constraint.
-- ---------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'skm_poin_non_negatif') THEN
        ALTER TABLE skm_activities
            ADD CONSTRAINT skm_poin_non_negatif CHECK (poin_skm >= 0);
    END IF;
    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'logbook_nomor_urut_positif') THEN
        ALTER TABLE logbook_entries
            ADD CONSTRAINT logbook_nomor_urut_positif CHECK (nomor_urut >= 1);
    END IF;
END $$;

-- =====================================================================
--  Auto-create a profile row when a user signs up
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, nama_lengkap, nim, email, instansi, tempat_kp)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'nama_lengkap', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data ->> 'nim', '-'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'instansi', 'Sekolah Tinggi Teknologi Bontang'),
        COALESCE(NEW.raw_user_meta_data ->> 'tempat_kp', 'PT Badak NGL')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
--  Row Level Security
--  profiles / internship_reports / report_comments are readable by every
--  authenticated user (the reference app shows a shared activity feed);
--  writes are always restricted to the owner.
-- =====================================================================
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE skm_activities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_comments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisors        ENABLE ROW LEVEL SECURITY;
ALTER TABLE logbook_entries    ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "profiles readable by authenticated" ON profiles;
CREATE POLICY "profiles readable by authenticated" ON profiles
    FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "profiles insert own" ON profiles;
CREATE POLICY "profiles insert own" ON profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles update own" ON profiles;
CREATE POLICY "profiles update own" ON profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- skm_activities — private portfolio
DROP POLICY IF EXISTS "skm own rows" ON skm_activities;
CREATE POLICY "skm own rows" ON skm_activities
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- internship_reports — shared feed, owner-only writes
DROP POLICY IF EXISTS "reports readable by authenticated" ON internship_reports;
CREATE POLICY "reports readable by authenticated" ON internship_reports
    FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "reports insert own" ON internship_reports;
CREATE POLICY "reports insert own" ON internship_reports
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "reports update own" ON internship_reports;
CREATE POLICY "reports update own" ON internship_reports
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "reports delete own" ON internship_reports;
CREATE POLICY "reports delete own" ON internship_reports
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- report_comments — anyone authenticated may read and comment, delete own only
DROP POLICY IF EXISTS "comments readable by authenticated" ON report_comments;
CREATE POLICY "comments readable by authenticated" ON report_comments
    FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "comments insert own" ON report_comments;
CREATE POLICY "comments insert own" ON report_comments
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "comments delete own" ON report_comments;
CREATE POLICY "comments delete own" ON report_comments
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- supervisors / logbook_entries — private
DROP POLICY IF EXISTS "supervisors own rows" ON supervisors;
CREATE POLICY "supervisors own rows" ON supervisors
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "logbook own rows" ON logbook_entries;
CREATE POLICY "logbook own rows" ON logbook_entries
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =====================================================================
--  Storage buckets
-- =====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('skm-certificates', 'skm-certificates', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('report-photos', 'report-photos', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Public read, owner-scoped writes. Uploads are stored under "<user_id>/<file>".
DROP POLICY IF EXISTS "qol public read" ON storage.objects;
CREATE POLICY "qol public read" ON storage.objects
    FOR SELECT USING (bucket_id IN ('skm-certificates', 'report-photos'));

DROP POLICY IF EXISTS "qol owner upload" ON storage.objects;
CREATE POLICY "qol owner upload" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id IN ('skm-certificates', 'report-photos')
        AND (STORAGE.FOLDERNAME(name))[1] = auth.uid()::TEXT
    );

DROP POLICY IF EXISTS "qol owner delete" ON storage.objects;
CREATE POLICY "qol owner delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id IN ('skm-certificates', 'report-photos')
        AND (STORAGE.FOLDERNAME(name))[1] = auth.uid()::TEXT
    );
