import { PrintToolbar } from "@/components/print/print-toolbar";
import { displayName, requireSession } from "@/lib/session";
import { ORG } from "@/lib/constants";
import {
  fetchCommentsFor,
  fetchFilteredReports,
  parseFilters,
  periodeLabel,
} from "@/lib/report-query";
import {
  computeStats,
  groupByBulan,
  recapByBulan,
  recapByKategori,
} from "@/lib/report-stats";
import {
  formatBulan,
  formatRentangJam,
  formatTanggal,
  formatTimestamp,
  pluralJam,
} from "@/lib/format";
import type { ReportComment } from "@/lib/types";

export const metadata = { title: "Laporan Kegiatan Magang" };
export const dynamic = "force-dynamic";

function IdentRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <tr>
      <td>{label}</td>
      <td>:</td>
      <td style={strong ? { fontWeight: 700, color: "var(--navy)" } : undefined}>{value}</td>
    </tr>
  );
}

export default async function RekapMagangPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { supabase, user, profile } = await requireSession();
  const filters = parseFilters(searchParams);

  const reports = await fetchFilteredReports(supabase, user.id, filters);
  const comments = filters.komentar
    ? await fetchCommentsFor(supabase, reports.map((r) => r.id))
    : new Map<string, ReportComment[]>();

  const nama = displayName(profile, user.email);
  const stats = computeStats(reports);
  const perKategori = recapByKategori(reports);
  const perBulan = recapByBulan(reports);
  const grouped = groupByBulan(reports);
  const kendalaList = reports.filter((r) => r.kendala?.trim());
  const periode = periodeLabel(filters, reports);

  return (
    <>
      <PrintToolbar title={`Rekap Laporan Magang — ${nama}`} backHref="/reports/export"
        hint="Tekan Cetak, lalu pilih tujuan “Save as PDF”. Ukuran A4 portrait."
      />

      <div className="sheet sheet-badak">
        {/* ------------------------------- Kop ------------------------------- */}
        <div className="badak-kop">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo" />
          <div>
            <h1>{ORG.perusahaan}</h1>
            <p>{ORG.perusahaanSub}</p>
          </div>
        </div>

        <div className="badak-title">
          <h2>LAPORAN KEGIATAN MAGANG</h2>
          <p>
            {nama} · Periode {periode}
          </p>
        </div>

        {/* ---------------------------- I. Identitas ---------------------------- */}
        <div className="sect-bar">I. IDENTITAS &amp; PERIODE</div>
        <table className="ident">
          <tbody>
            <IdentRow label="Nama Peserta" value={nama} strong />
            <IdentRow label="Instansi / Sekolah" value={profile?.instansi || ORG.kampus} />
            <IdentRow label="Email" value={profile?.email || user.email || "-"} />
            <IdentRow label="Tempat Kerja Praktek" value={profile?.tempat_kp || ORG.perusahaanMixed} />
            <IdentRow label="Periode Kegiatan" value={periode} />
            <IdentRow
              label="Filter Tanggal"
              value={filters.dari || filters.sampai ? periode : "Seluruh periode"}
            />
            <IdentRow label="Filter Kategori" value={filters.kategori || "Semua kategori"} />
          </tbody>
        </table>

        {/* ---------------------------- II. Ringkasan ---------------------------- */}
        <div className="sect-bar">II. RINGKASAN KEGIATAN</div>
        <div className="kpi-grid">
          <div className="kpi-box">
            <b>{stats.totalLaporan}</b>
            <span>Laporan Kegiatan</span>
          </div>
          <div className="kpi-box">
            <b>{stats.hariAktif}</b>
            <span>Hari Aktif</span>
          </div>
          <div className="kpi-box">
            <b>{stats.totalJam.toFixed(1)}</b>
            <span>Total Jam Kegiatan</span>
          </div>
          <div className="kpi-box">
            <b>{stats.jenisKategori}</b>
            <span>Jenis Kategori</span>
          </div>
        </div>
        <table className="ident">
          <tbody>
            <IdentRow
              label="Total durasi tercatat"
              value={stats.totalJam ? pluralJam(stats.totalJam) : "-"}
            />
            <IdentRow
              label="Rata-rata per hari aktif"
              value={stats.rataPerHari ? `${pluralJam(stats.rataPerHari)} / hari` : "-"}
            />
            <IdentRow label="Kategori terbanyak" value={stats.kategoriTerbanyak ?? "-"} />
            <IdentRow label="Kegiatan berkendala" value={`${stats.kegiatanBerkendala} kegiatan`} />
            <IdentRow label="Kegiatan berfoto" value={`${stats.kegiatanBerfoto} kegiatan`} />
          </tbody>
        </table>

        {/* -------------------------- III. Per kategori -------------------------- */}
        {perKategori.length > 0 && (
          <>
            <div className="sect-bar">III. REKAP PER KATEGORI</div>
            <table className="ptbl">
              <thead>
                <tr>
                  <th>Kategori</th>
                  <th className="num">Jumlah</th>
                  <th className="num">Durasi</th>
                  <th className="num">Porsi</th>
                </tr>
              </thead>
              <tbody>
                {perKategori.map((k) => (
                  <tr key={k.kategori}>
                    <td>{k.kategori}</td>
                    <td className="num">{k.jumlah}</td>
                    <td className="num">{k.jam ? pluralJam(k.jam) : "-"}</td>
                    <td className="num">{k.porsi.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ---------------------------- IV. Per bulan ---------------------------- */}
        {perBulan.length > 0 && (
          <>
            <div className="sect-bar">IV. REKAP PER BULAN</div>
            <table className="ptbl">
              <thead>
                <tr>
                  <th>Bulan</th>
                  <th className="num">Jumlah Kegiatan</th>
                  <th className="num">Total Durasi</th>
                </tr>
              </thead>
              <tbody>
                {perBulan.map((b) => (
                  <tr key={b.bulan}>
                    <td>{formatBulan(b.bulan)}</td>
                    <td className="num">{b.jumlah}</td>
                    <td className="num">{b.jam ? pluralJam(b.jam) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ------------------------- V. Daftar kegiatan ------------------------- */}
        <div className="sect-bar">V. DAFTAR KEGIATAN</div>
        {reports.length === 0 ? (
          <div className="empty-note">Belum ada laporan kegiatan pada rentang yang dipilih.</div>
        ) : (
          grouped.map(([bulan, list]) => (
            <div key={bulan}>
              <p className="bulan-head">
                {formatBulan(bulan)} · {list.length} kegiatan
              </p>
              {list.map((r) => {
                const komentar = comments.get(r.id) ?? [];
                return (
                  <div key={r.id} className="keg">
                    <div className="keg-head">
                      <b>{r.judul}</b>
                      <span className="keg-meta">
                        {formatTanggal(r.tanggal)} · {formatRentangJam(r.jam_mulai, r.jam_selesai)} ·{" "}
                        {r.kategori}
                      </span>
                    </div>

                    <dl>
                      {r.deskripsi?.trim() && (
                        <>
                          <dt>Deskripsi</dt>
                          <dd>{r.deskripsi}</dd>
                        </>
                      )}
                      {r.output?.trim() && (
                        <>
                          <dt>Output</dt>
                          <dd>{r.output}</dd>
                        </>
                      )}
                      {r.kendala?.trim() && (
                        <>
                          <dt>Kendala</dt>
                          <dd>{r.kendala}</dd>
                        </>
                      )}
                    </dl>

                    {filters.foto && r.foto_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="keg-foto" src={r.foto_url} alt={r.judul} />
                    )}

                    {filters.komentar && komentar.length > 0 && (
                      <div className="keg-komentar">
                        {komentar.map((c) => (
                          <p key={c.id}>
                            <b>{c.profiles?.nama_lengkap ?? "Pembimbing"}:</b> {c.isi}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}

        {/* --------------------------- VI. Catatan kendala --------------------------- */}
        {kendalaList.length > 0 && (
          <>
            <div className="sect-bar">VI. CATATAN KENDALA</div>
            <table className="ptbl">
              <thead>
                <tr>
                  <th style={{ width: "32mm" }}>Tanggal</th>
                  <th>Kegiatan</th>
                  <th>Kendala</th>
                </tr>
              </thead>
              <tbody>
                {kendalaList.map((r) => (
                  <tr key={r.id}>
                    <td>{formatTanggal(r.tanggal)}</td>
                    <td>{r.judul}</td>
                    <td style={{ whiteSpace: "pre-line" }}>{r.kendala}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ----------------------------- Pengesahan ----------------------------- */}
        <div className="sect-bar">{kendalaList.length > 0 ? "VII" : "VI"}. PENGESAHAN</div>
        <div className="ttd">
          <div>
            <p style={{ margin: 0 }}>Peserta Magang,</p>
            <div className="ttd-slot" />
            <div className="ttd-line">
              <b>{nama}</b>
              <span>{profile?.instansi || ORG.kampus}</span>
            </div>
          </div>
          <div>
            <p style={{ margin: 0 }}>Mengetahui, Pembimbing Lapangan</p>
            <div className="ttd-slot" />
            <div className="ttd-line">
              <b>{profile?.pembimbing_nama || " "}</b>
              <span>{profile?.pembimbing_jabatan || profile?.tempat_kp || ORG.perusahaanMixed}</span>
            </div>
          </div>
        </div>

        <div className="print-foot">
          <span>Dicetak dari aplikasi Task Report Magang · {ORG.perusahaanMixed}</span>
          <span>
            {formatTimestamp(new Date())} · oleh {nama}
          </span>
        </div>
      </div>
    </>
  );
}
