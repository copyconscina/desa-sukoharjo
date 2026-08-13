import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type {
  Umkm,
  Berita,
  GaleriItem,
  Potensi,
  Lembaga,
  ProfilDesa,
  Agenda,
  BukuTamu,
  Pengaduan,
  ApbdesRingkasan,
  ApbdesBidang,
  ProdukHukum,
  StatistikPenduduk,
} from "@/lib/data";

/**
 * Data lengkap yang dipakai untuk membangun laporan PDF ekspor data desa.
 * Semua daftar diambil langsung dari Supabase melalui lib/db.ts di server
 * component, lalu dikirim sebagai props ke komponen client ini.
 */
export type ExportData = {
  profil: ProfilDesa;
  lembagaList: Lembaga[];
  potensiList: Potensi[];
  agendaList: Agenda[];
  pengaduanList: Pengaduan[];
  bukuTamuList: BukuTamu[];
  apbdesRingkasan: ApbdesRingkasan;
  apbdesBidangList: ApbdesBidang[];
  produkHukumList: ProdukHukum[];
  statistikPenduduk: StatistikPenduduk;
  beritaList: Berita[];
  umkmList: Umkm[];
  galeriList: GaleriItem[];
};

export type ExportModuleKey =
  | "profil"
  | "layanan"
  | "transparansi"
  | "berita"
  | "umkm"
  | "galeri";

export type ExportSelection = Record<ExportModuleKey, boolean>;

export const EXPORT_MODULES: {
  key: ExportModuleKey;
  label: string;
  desc: string;
}[] = [
  { key: "profil", label: "Profil Desa & Kelembagaan", desc: "Visi misi, lembaga desa, dan potensi desa" },
  { key: "layanan", label: "Layanan Warga", desc: "Agenda kegiatan, pengaduan, dan buku tamu" },
  { key: "transparansi", label: "Transparansi", desc: "APBDes, produk hukum, dan statistik penduduk" },
  { key: "berita", label: "Berita & Pengumuman", desc: "Seluruh berita yang telah dipublikasikan" },
  { key: "umkm", label: "Database UMKM", desc: "Profil usaha warga yang terdaftar" },
  { key: "galeri", label: "Galeri Desa", desc: "Daftar dokumentasi foto kegiatan & sektor desa" },
];

type RGB = [number, number, number];

const COLOR = {
  forestDeep: [33, 47, 28] as RGB,
  forest: [57, 84, 47] as RGB,
  sawahLight: [195, 209, 159] as RGB,
  ink: [31, 37, 29] as RGB,
  inkSoft: [95, 102, 91] as RGB,
  line: [227, 230, 219] as RGB,
  parchment2: [243, 244, 238] as RGB,
  white: [255, 255, 255] as RGB,
};

function stripHtml(html?: string | null, maxLen = 320): string {
  if (!html) return "-";
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return "-";
  return text.length > maxLen ? `${text.slice(0, maxLen)}...` : text;
}

/**
 * Membangun dokumen jsPDF berisi seluruh data yang dipilih admin.
 * Formatting dirancang agar rapi & mudah dibaca: kop resmi di halaman
 * pertama, judul seksi bergaya kartu, tabel bergaris zebra, serta nomor
 * halaman & catatan kaki di setiap halaman.
 */
export function generateLaporanPdf(data: ExportData, selection: ExportSelection): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;
  const tableMarginTop = 24;

  let cursorY = 0;

  const now = new Date();
  const generatedAt = now.toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" });

  function drawCoverHeader() {
    doc.setFillColor(...COLOR.forestDeep);
    doc.rect(0, 0, pageWidth, 32, "F");

    doc.setTextColor(...COLOR.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14.5);
    doc.text("PEMERINTAH DESA SUKOHARJO", marginX, 12.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text("Kecamatan Tirtomoyo, Kabupaten Wonogiri", marginX, 18.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("LAPORAN EKSPOR DATA WEBSITE DESA", marginX, 27);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Dicetak: ${generatedAt}`, pageWidth - marginX, 12.5, { align: "right" });
    doc.text("Sumber data: Supabase (basis data resmi)", pageWidth - marginX, 17.5, { align: "right" });

    cursorY = 40;
  }

  function ensureSpace(needed: number) {
    if (cursorY + needed > pageHeight - 20) {
      doc.addPage();
      cursorY = 16;
    }
  }

  function sectionTitle(title: string, note?: string) {
    ensureSpace(16);
    doc.setFillColor(...COLOR.sawahLight);
    doc.rect(marginX, cursorY, pageWidth - marginX * 2, 9, "F");
    doc.setTextColor(...COLOR.forestDeep);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.text(title, marginX + 3, cursorY + 6.3);
    if (note) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(note, pageWidth - marginX - 3, cursorY + 6.3, { align: "right" });
    }
    cursorY += 9 + 5;
  }

  function subheading(text: string) {
    ensureSpace(8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...COLOR.forest);
    doc.text(text, marginX, cursorY);
    cursorY += 5;
  }

  function paragraph(text: string) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLOR.ink);
    const lines = doc.splitTextToSize(text || "-", pageWidth - marginX * 2);
    ensureSpace(lines.length * 4.2 + 3);
    doc.text(lines, marginX, cursorY);
    cursorY += lines.length * 4.2 + 4;
  }

  function table(
    head: string[],
    body: (string | number)[][],
    columnStyles?: Record<number, { cellWidth?: number; halign?: "left" | "center" | "right" }>
  ) {
    if (body.length === 0) {
      paragraph("Belum ada data pada modul ini.");
      return;
    }
    autoTable(doc, {
      head: [head],
      body,
      startY: cursorY,
      margin: { left: marginX, right: marginX, top: tableMarginTop, bottom: 20 },
      styles: {
        font: "helvetica",
        fontSize: 8.2,
        cellPadding: 2.2,
        textColor: COLOR.ink,
        lineColor: COLOR.line,
        lineWidth: 0.1,
        overflow: "linebreak",
        valign: "top",
      },
      headStyles: {
        fillColor: COLOR.forest,
        textColor: COLOR.white,
        fontStyle: "bold",
        fontSize: 8.4,
        halign: "left",
      },
      alternateRowStyles: { fillColor: COLOR.parchment2 },
      columnStyles,
    });
    // jspdf-autotable menyimpan posisi akhir tabel pada doc.lastAutoTable
    cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7;
  }

  // ---------------------------------------------------------------------
  drawCoverHeader();
  paragraph(
    "Dokumen ini merangkum seluruh data yang tersimpan pada basis data Supabase Website Desa Sukoharjo, sesuai modul yang dipilih pada saat proses ekspor dilakukan melalui Panel Admin."
  );

  let sectionNumber = 0;
  const noCol = { 0: { cellWidth: 9, halign: "center" as const } };

  if (selection.profil) {
    sectionNumber += 1;
    sectionTitle(`${sectionNumber}. Profil Desa & Kelembagaan`);

    subheading("Visi Desa");
    paragraph(data.profil.visi || "-");

    subheading("Misi Desa");
    paragraph(
      data.profil.misi && data.profil.misi.length
        ? data.profil.misi.map((m, i) => `${i + 1}. ${m}`).join("\n")
        : "-"
    );

    subheading(`Daftar Lembaga Desa  (${data.lembagaList.length} lembaga)`);
    table(
      ["No", "Nama Lembaga", "Ketua", "Anggota", "Deskripsi"],
      data.lembagaList.map((l, i) => [i + 1, l.name, l.leader, l.members, l.desc]),
      { ...noCol, 1: { cellWidth: 32 }, 2: { cellWidth: 28 }, 3: { cellWidth: 20 } }
    );

    subheading(`Potensi Desa  (${data.potensiList.length} sektor)`);
    table(
      ["No", "Sektor", "Deskripsi"],
      data.potensiList.map((p, i) => [p.num || i + 1, p.title, p.desc]),
      { 0: { cellWidth: 14 }, 1: { cellWidth: 42 } }
    );
  }

  if (selection.layanan) {
    sectionNumber += 1;
    sectionTitle(`${sectionNumber}. Layanan Warga`);

    subheading(`Agenda Kegiatan  (${data.agendaList.length} agenda)`);
    table(
      ["No", "Judul", "Tanggal", "Waktu", "Lokasi", "Kategori"],
      data.agendaList.map((a, i) => [i + 1, a.title, a.date, a.time, a.location, a.category]),
      noCol
    );

    subheading(`Pengaduan Warga  (${data.pengaduanList.length} laporan)`);
    table(
      ["No", "Nama", "Dusun", "Judul", "Tanggal", "Status"],
      data.pengaduanList.map((p, i) => [i + 1, p.nama, p.dusun, p.judul, p.tanggal || "-", p.status]),
      noCol
    );

    subheading(`Buku Tamu  (${data.bukuTamuList.length} entri)`);
    table(
      ["No", "Nama", "Asal", "Pesan", "Tanggal"],
      data.bukuTamuList.map((b, i) => [i + 1, b.name, b.origin, b.message, b.date || "-"]),
      noCol
    );
  }

  if (selection.transparansi) {
    sectionNumber += 1;
    sectionTitle(`${sectionNumber}. Transparansi Anggaran & Hukum`);

    subheading(`Ringkasan APBDes Tahun ${data.apbdesRingkasan.tahun}`);
    table(
      ["Pendapatan", "Belanja", "Pembiayaan"],
      [[data.apbdesRingkasan.pendapatan, data.apbdesRingkasan.belanja, data.apbdesRingkasan.pembiayaan]]
    );

    subheading(`Rincian Bidang APBDes  (${data.apbdesBidangList.length} bidang)`);
    table(
      ["No", "Bidang", "Anggaran", "Realisasi", "%", "Deskripsi"],
      data.apbdesBidangList.map((b, i) => [i + 1, b.name, b.anggaran, b.realisasi, b.pct, b.desc]),
      { ...noCol, 5: { cellWidth: 40 } }
    );

    subheading(`Produk Hukum Desa  (${data.produkHukumList.length} dokumen)`);
    table(
      ["No", "Nomor", "Judul", "Kategori", "Tanggal"],
      data.produkHukumList.map((p, i) => [i + 1, p.nomor, p.judul, p.kategori, p.tanggal]),
      noCol
    );

    const st = data.statistikPenduduk;
    subheading("Statistik Kependudukan — Ringkasan");
    table(
      ["Total Penduduk", "Total KK", "Laki-laki", "Perempuan"],
      [[st.totalPenduduk, st.totalKk, st.lakiLaki, st.perempuan]]
    );

    subheading(`Sebaran Penduduk per Dusun  (${st.dusunList.length} dusun)`);
    table(
      ["No", "Dusun", "RT", "RW", "Jiwa"],
      st.dusunList.map((d, i) => [i + 1, d.nama, d.rt, d.rw, d.jiwa]),
      noCol
    );

    subheading("Tingkat Pendidikan");
    table(
      ["Jenjang Pendidikan", "Jumlah"],
      st.pendidikanList.map((p) => [p.name, p.count])
    );

    subheading("Mata Pencaharian");
    table(
      ["Pekerjaan", "Jumlah", "Persentase"],
      st.pekerjaanList.map((p) => [p.name, p.count, `${p.pct}%`])
    );
  }

  if (selection.berita) {
    sectionNumber += 1;
    sectionTitle(`${sectionNumber}. Berita & Pengumuman`, `${data.beritaList.length} berita`);
    table(
      ["No", "Tanggal", "Kategori", "Judul", "Ringkasan"],
      data.beritaList.map((b, i) => [i + 1, b.date || "-", b.tag, b.title, stripHtml(b.desc)]),
      { ...noCol, 3: { cellWidth: 32 }, 4: { cellWidth: 55 } }
    );
  }

  if (selection.umkm) {
    sectionNumber += 1;
    sectionTitle(`${sectionNumber}. Database UMKM`, `${data.umkmList.length} usaha terdaftar`);
    table(
      ["No", "Nama Usaha", "Pemilik", "Kategori", "Produk", "Alamat", "Kontak"],
      data.umkmList.map((u, i) => [
        i + 1,
        u.name,
        u.owner,
        u.category,
        u.product,
        u.address,
        u.wa || u.phone || "-",
      ]),
      noCol
    );
  }

  if (selection.galeri) {
    sectionNumber += 1;
    sectionTitle(`${sectionNumber}. Galeri Desa`, `${data.galeriList.length} dokumentasi foto`);
    table(
      ["No", "Judul", "Kategori", "Keterangan"],
      data.galeriList.map((g, i) => [i + 1, g.label, g.cat, stripHtml(g.desc, 200)]),
      { ...noCol, 3: { cellWidth: 60 } }
    );
  }

  if (sectionNumber === 0) {
    paragraph("Tidak ada modul data yang dipilih untuk diekspor.");
  }

  // ---------------------------------------------------------------------
  // Kop tipis berulang di setiap halaman lanjutan + catatan kaki & nomor
  // halaman pada seluruh halaman (termasuk halaman pertama).
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    if (i > 1) {
      doc.setFillColor(...COLOR.forest);
      doc.rect(0, 0, pageWidth, 10, "F");
      doc.setTextColor(...COLOR.white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.3);
      doc.text("LAPORAN DATA WEBSITE DESA SUKOHARJO", marginX, 6.6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text(generatedAt, pageWidth - marginX, 6.6, { align: "right" });
    }

    doc.setDrawColor(...COLOR.line);
    doc.setLineWidth(0.2);
    doc.line(marginX, pageHeight - 14, pageWidth - marginX, pageHeight - 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR.inkSoft);
    doc.text("Dokumen dibuat otomatis oleh Panel Admin — Website Desa Sukoharjo", marginX, pageHeight - 9);
    doc.text(`Halaman ${i} dari ${pageCount}`, pageWidth - marginX, pageHeight - 9, { align: "right" });
  }

  return doc;
}

export function buildExportFilename(selection: ExportSelection): string {
  const selected = EXPORT_MODULES.filter((m) => selection[m.key]).length;
  const dateStr = new Date().toISOString().slice(0, 10);
  const scope = selected === EXPORT_MODULES.length ? "lengkap" : "sebagian";
  return `laporan-data-desa-sukoharjo-${scope}-${dateStr}.pdf`;
}
