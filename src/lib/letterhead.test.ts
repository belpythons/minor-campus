import { describe, expect, it } from "vitest";
import { ORG } from "./constants";
import {
  DEFAULT_LETTERHEAD,
  resolveLetterhead,
  slugify,
  type LetterheadSettings,
} from "./letterhead";

function row(overrides: Partial<LetterheadSettings> = {}): LetterheadSettings {
  return {
    user_id: "u1",
    kop_baris: ["PT BADAK NGL", "Program Magang / Praktik Kerja Lapangan · Bontang, Kalimantan Timur"],
    judul_dokumen: "LAPORAN KEGIATAN MAGANG",
    kampus_upper: "SEKOLAH TINGGI TEKNOLOGI BONTANG",
    prodi_upper: "PROGRAM STUDI TEKNIK INFORMATIKA",
    formulir_title: "FORM KEHADIRAN DAN AKTIFITAS KERJA PRAKTEK",
    kode_sop: "TI-SOP-17/FM-01",
    lokasi_ttd: "Bontang",
    logo_url: null,
    logo_versi: 0,
    updated_at: null,
    ...overrides,
  };
}

describe("resolveLetterhead without settings", () => {
  it("returns the legacy ORG identity exactly", () => {
    const lh = resolveLetterhead(null);
    expect(lh).toBe(DEFAULT_LETTERHEAD);
    expect(lh.kopBaris).toEqual([ORG.perusahaan, ORG.perusahaanSub]);
    expect(lh.judulDokumen).toBe("LAPORAN KEGIATAN MAGANG");
    expect(lh.kampusUpper).toBe(ORG.kampusUpper);
    expect(lh.prodiUpper).toBe(ORG.prodiUpper);
    expect(lh.formulirTitle).toBe(ORG.formulirTitle);
    expect(lh.kodeSop).toBe(ORG.kodeSop);
    expect(lh.lokasiTtd).toBe(ORG.lokasi);
    expect(lh.logoSrc).toBe("/logo.png");
    expect(lh.customLogo).toBe(false);
    expect(lh.orgNama).toBe(ORG.perusahaanMixed);
    expect(lh.appSubtitle).toBe("STITEK · PT Badak NGL");
    expect(lh.exportFilePrefix).toBe("laporan-magang");
    expect(lh.footerText).toBe(
      `Dicetak dari aplikasi Task Report Magang · ${ORG.perusahaanMixed}`,
    );
  });
});

describe("resolveLetterhead with settings", () => {
  it("uses the custom identity everywhere", () => {
    const lh = resolveLetterhead(
      row({
        kop_baris: ["UNIVERSITAS MULAWARMAN", "Fakultas Teknik", "Samarinda, Kaltim"],
        judul_dokumen: "LAPORAN PKL",
        kampus_upper: "UNIVERSITAS MULAWARMAN",
        logo_url: "https://x.supabase.co/storage/v1/object/public/org-logos/u1/logo-v2.png",
        logo_versi: 2,
      }),
    );
    expect(lh.kopBaris).toHaveLength(3);
    expect(lh.judulDokumen).toBe("LAPORAN PKL");
    expect(lh.customLogo).toBe(true);
    expect(lh.orgNama).toBe("UNIVERSITAS MULAWARMAN");
    expect(lh.exportFilePrefix).toBe("laporan-pkl");
    expect(lh.footerText).toBe(
      "Dicetak dari aplikasi Task Report Magang · UNIVERSITAS MULAWARMAN",
    );
  });

  it("keeps the legacy filename prefix while judul is unchanged", () => {
    expect(resolveLetterhead(row({ logo_url: "https://x/y.png" })).exportFilePrefix).toBe(
      "laporan-magang",
    );
  });

  it("guards against empty or oversized kop_baris", () => {
    expect(resolveLetterhead(row({ kop_baris: ["  ", ""] })).kopBaris).toEqual(
      DEFAULT_LETTERHEAD.kopBaris,
    );
    expect(
      resolveLetterhead(row({ kop_baris: ["a", "b", "c", "d", "e"] })).kopBaris,
    ).toEqual(["a", "b", "c", "d"]);
  });

  it("falls back per-field when a field is blanked", () => {
    const lh = resolveLetterhead(row({ kode_sop: " ", formulir_title: "" }));
    expect(lh.kodeSop).toBe(ORG.kodeSop);
    expect(lh.formulirTitle).toBe(ORG.formulirTitle);
  });
});

describe("slugify", () => {
  it("slugs Indonesian document titles", () => {
    expect(slugify("LAPORAN PKL — Teknik Informatika")).toBe("laporan-pkl-teknik-informatika");
    expect(slugify("   ")).toBe("laporan-magang");
  });
});
