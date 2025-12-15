/**
 * Uploads Module
 * Handles upload data integration into mock data
 */

import { loadMockData, persistMockData, getMockData, setMockData } from './cache.js';
import { generateIdPegawai, generateKodeTk, logNonaktifHistory } from './utils.js';
import { convertPeriodeToKey } from '../../utils/dataTransform.js';
import { calculateTotalContributions } from '../../utils/contributionCalculator.js';

/**
 * Integrasikan data upload ke mock data
 * @param {Object} uploadData - Data yang baru diupload
 * @param {string} periode - Periode dalam format "2025-11" atau "11/2025"
 * @returns {Promise<Object>} Response dengan count data
 */
export async function integrateUploadData(uploadData, periode = null) {
    const data = await loadMockData();
    const periodeKey = periode ? convertPeriodeToKey(periode) : data.currentPeriod;

    if (!periodeKey) {
        throw new Error("Periode tidak ditemukan");
    }

    // Pastikan report untuk periode ini ada
    if (!data.reports) {
        data.reports = {};
    }
    if (!data.reports[periodeKey]) {
        data.reports[periodeKey] = {
            periode: periodeKey,
            periodeDisplay: periodeKey.split('-').reverse().join('/'),
            summary: {
                totalTenagaKerja: 0,
                totalUpahRapel: 0,
                totalIuran: 0,
                totalDenda: 0
            },
            riskLevel: "Rendah",
            useTotalUpahForContribution: false,
            rincianIuran: [],
            workers: { data: [] }
        };
    }

    const report = data.reports[periodeKey];
    if (!report.workers) {
        report.workers = { data: [] };
    }
    if (!report.workers.data) {
        report.workers.data = [];
    }

    let newWorkersCount = 0;
    let updatedWorkersCount = 0;

    // Proses data berdasarkan jenis upload
    if (uploadData.uploadType === 'tk-massal') {
        const isTkLanjutan = uploadData.subType === 'lanjutan' || uploadData.jenis === 'TK Lanjutan';

        // Pastikan data ada dan berupa array
        if (!uploadData.data || !Array.isArray(uploadData.data)) {
            console.warn('uploadData.data tidak valid:', uploadData);
            return {
                success: false,
                message: "Data upload tidak valid",
                newWorkersCount: 0,
                updatedWorkersCount: 0,
                totalWorkers: report.workers.data.length
            };
        }

        // TK Mendaftar/Lanjutan: INSERT data baru dengan status AKTIF
        uploadData.data.forEach((row, index) => {
            const kpjValue = row.NOMOR_IDENTITAS_KPJ || row.KPJ || "-";
            const nikValue = row.NIK || row.NOMOR_IDENTITAS || "-";
            const noPegawaiValue = row.NO_PEGAWAI || row.NOMOR_PEGAWAI || "";

            let existingIndex = -1;

            if (isTkLanjutan) {
                // TK Lanjutan: Proses penggantian melihat dari no pegawai
                // Hanya update TK yang tidak memiliki KPJ
                if (noPegawaiValue) {
                    existingIndex = report.workers.data.findIndex(w => {
                        // Cari berdasarkan noPegawai (jika ada di worker)
                        if (w.noPegawai && w.noPegawai !== "" && w.noPegawai === noPegawaiValue) {
                            // Pastikan worker tidak memiliki KPJ (hanya update yang tidak punya KPJ)
                            return (!w.kpj || w.kpj === "-");
                        }
                        return false;
                    });
                }
            } else {
                // TK Mendaftar: Cari existing worker berdasarkan NIK dulu (lebih konsisten), lalu KPJ
                existingIndex = report.workers.data.findIndex(w => {
                    // Cek berdasarkan NIK (jika ada dan tidak kosong)
                    if (nikValue && nikValue !== "-" && w.nik && w.nik !== "-") {
                        return w.nik === nikValue;
                    }
                    // Cek berdasarkan KPJ (jika ada dan tidak kosong)
                    if (kpjValue && kpjValue !== "-" && w.kpj && w.kpj !== "-") {
                        return w.kpj === kpjValue;
                    }
                    return false;
                });
            }

            if (existingIndex === -1) {
                // Data baru - Generate ID_PEGAWAI dan KODE_TK
                const idPegawai = generateIdPegawai();
                const kodeTk = generateKodeTk(report.workers.data.length + 1);

                const newWorker = {
                    no: report.workers.data.length + 1,
                    idPegawai: idPegawai,
                    kodeTk: kodeTk,
                    nik: nikValue,
                    nama: row.NAMA_LENGKAP,
                    jk: row.JENIS_KELAMIN === "LAKI-LAKI" ? "Laki-laki" :
                        row.JENIS_KELAMIN === "PEREMPUAN" ? "Perempuan" :
                            row.JENIS_KELAMIN || "Laki-laki",
                    kpj: kpjValue,
                    upahPokok: row.UPAH || 0,
                    rapel: 0,
                    totalUpah: row.UPAH || 0,
                    status: "AKTIF"
                };

                // Tambahkan noPegawai jika ada (untuk TK Lanjutan dan TK Mendaftar)
                if (noPegawaiValue) {
                    newWorker.noPegawai = noPegawaiValue;
                }

                // Untuk TK Baru: status AKTIF tapi belum punya KPJ dan upah (jika tidak diisi)
                if (!isTkLanjutan) {
                    // TK Baru: KPJ dan upah bisa kosong
                    if (!kpjValue || kpjValue === "-") {
                        newWorker.kpj = "-";
                    }
                    if (!row.UPAH || row.UPAH === 0) {
                        newWorker.upahPokok = 0;
                        newWorker.totalUpah = 0;
                    }
                }

                report.workers.data.push(newWorker);
                newWorkersCount++;
            } else {
                // Update existing worker
                const existingWorker = report.workers.data[existingIndex];

                if (isTkLanjutan) {
                    // TK Lanjutan: Update TK yang tidak memiliki KPJ
                    // Pastikan hanya update yang tidak punya KPJ
                    if (!existingWorker.kpj || existingWorker.kpj === "-") {
                        const existingHasNoKpj = !existingWorker.kpj || existingWorker.kpj === "-";
                        const newHasKpj = kpjValue && kpjValue !== "-";

                        // Update dengan data baru
                        report.workers.data[existingIndex] = {
                            ...existingWorker,
                            nik: nikValue !== "-" ? nikValue : existingWorker.nik,
                            nama: row.NAMA_LENGKAP || existingWorker.nama,
                            jk: row.JENIS_KELAMIN === "LAKI-LAKI" ? "Laki-laki" :
                                row.JENIS_KELAMIN === "PEREMPUAN" ? "Perempuan" :
                                    existingWorker.jk,
                            kpj: (existingHasNoKpj && newHasKpj) ? kpjValue :
                                (newHasKpj ? kpjValue : existingWorker.kpj),
                            upahPokok: row.UPAH || existingWorker.upahPokok || 0,
                            rapel: 0,
                            totalUpah: row.UPAH || existingWorker.totalUpah || 0,
                            status: "AKTIF",
                            noPegawai: noPegawaiValue || existingWorker.noPegawai || ""
                        };
                        updatedWorkersCount++;
                    }
                    // Jika existing worker sudah punya KPJ, skip (tidak diupdate)
                } else {
                    // TK Mendaftar: Update seperti biasa
                    const existingHasNoKpj = !existingWorker.kpj || existingWorker.kpj === "-";
                    const newHasKpj = kpjValue && kpjValue !== "-";

                    // Update dengan data baru (yang terbaru)
                    // Jika existing tidak punya KPJ dan baru punya KPJ, pastikan KPJ diupdate
                    report.workers.data[existingIndex] = {
                        ...existingWorker,
                        nik: nikValue !== "-" ? nikValue : existingWorker.nik,
                        nama: row.NAMA_LENGKAP || existingWorker.nama,
                        jk: row.JENIS_KELAMIN === "LAKI-LAKI" ? "Laki-laki" :
                            row.JENIS_KELAMIN === "PEREMPUAN" ? "Perempuan" :
                                existingWorker.jk,
                        kpj: (existingHasNoKpj && newHasKpj) ? kpjValue :
                            (newHasKpj ? kpjValue : existingWorker.kpj),
                        upahPokok: row.UPAH || existingWorker.upahPokok || 0,
                        rapel: 0,
                        totalUpah: row.UPAH || existingWorker.totalUpah || 0,
                        status: "AKTIF",
                        noPegawai: noPegawaiValue || existingWorker.noPegawai || ""
                    };
                    updatedWorkersCount++;
                }
            }
        });
    } else if (uploadData.uploadType === 'tk-nonaktif') {
        // TK Nonaktif: UPDATE status menjadi NONAKTIF berdasarkan KPJ yang sama
        // Pastikan data ada dan berupa array
        if (!uploadData.data || !Array.isArray(uploadData.data)) {
            console.warn('uploadData.data tidak valid untuk TK Nonaktif:', uploadData);
            return {
                success: false,
                message: "Data upload tidak valid",
                newWorkersCount: 0,
                updatedWorkersCount: 0,
                totalWorkers: report.workers.data.length
            };
        }

        // Inisialisasi array untuk menyimpan riwayat nonaktif
        if (!data.tenagaKerjaNonaktif) {
            data.tenagaKerjaNonaktif = [];
        }

        uploadData.data.forEach(row => {
            const kpj = (row.KPJ || row.NOMOR_IDENTITAS_KPJ || "").toString().trim();
            const sebabNa = row.SEBAB_NA || row.SEBAB_NA_NAMA || "";
            const tglKejadian = row.TGL_KEJADIAN || "";
            const keterangan = row.KETERANGAN || "";

            // Skip jika KPJ kosong atau "-"
            if (!kpj || kpj === "-") {
                return;
            }

            // Cari worker berdasarkan KPJ yang sama (case sensitive)
            const workerIndex = report.workers.data.findIndex(w => {
                const workerKpj = (w.kpj || "").toString().trim();
                return workerKpj === kpj && workerKpj !== "-";
            });

            if (workerIndex !== -1) {
                const worker = report.workers.data[workerIndex];
                // Hanya nonaktifkan jika statusnya AKTIF (jangan nonaktifkan yang sudah NONAKTIF)
                if (worker.status === "AKTIF") {
                    // Log riwayat nonaktif sebelum update status
                    const historyEntry = logNonaktifHistory(
                        worker,
                        sebabNa,
                        tglKejadian,
                        keterangan
                    );
                    data.tenagaKerjaNonaktif.push(historyEntry);

                    // Update status menjadi NONAKTIF
                    report.workers.data[workerIndex].status = "NONAKTIF";
                    updatedWorkersCount++;
                }
            }
        });
    } else if (uploadData.uploadType === 'upah-massal') {
        // Upah Massal: UPDATE upah untuk periode tertentu
        // Hanya mengupdate data yang sudah ada, tidak membuat data baru

        // Pastikan data ada dan berupa array
        if (!uploadData.data || !Array.isArray(uploadData.data)) {
            console.warn('uploadData.data tidak valid untuk Upah Massal:', uploadData);
            return {
                success: false,
                message: "Data upload tidak valid",
                newWorkersCount: 0,
                updatedWorkersCount: 0,
                totalWorkers: report.workers.data.length
            };
        }

        uploadData.data.forEach(row => {
            const kpj = (row.KPJ || "").toString().trim();
            const nik = (row.NIK || "").toString().trim();
            const noPegawai = (row.NO_PEGAWAI || "").toString().trim();

            // Cari worker berdasarkan KPJ, NIK, atau NO_PEGAWAI
            // Prioritas: KPJ > NIK > NO_PEGAWAI
            let workerIndex = -1;

            if (kpj && kpj !== "-") {
                // Cari berdasarkan KPJ (prioritas pertama)
                workerIndex = report.workers.data.findIndex(w => {
                    const workerKpj = (w.kpj || "").toString().trim();
                    return workerKpj === kpj && workerKpj !== "-";
                });
            }

            if (workerIndex === -1 && nik && nik !== "-") {
                // Jika tidak ditemukan dengan KPJ, cari berdasarkan NIK
                workerIndex = report.workers.data.findIndex(w => {
                    const workerNik = (w.nik || "").toString().trim();
                    return workerNik === nik && workerNik !== "-";
                });
            }

            if (workerIndex === -1 && noPegawai) {
                // Jika tidak ditemukan dengan KPJ atau NIK, cari berdasarkan NO_PEGAWAI
                workerIndex = report.workers.data.findIndex(w => {
                    const workerNoPegawai = (w.noPegawai || "").toString().trim();
                    return workerNoPegawai === noPegawai && workerNoPegawai !== "";
                });
            }

            // Hanya update jika worker ditemukan (data sudah ada)
            if (workerIndex !== -1) {
                const upahValue = Number(row.UPAH) || 0;
                const rapelValue = Number(row.RAPEL) || 0;

                report.workers.data[workerIndex].upahPokok = upahValue || report.workers.data[workerIndex].upahPokok || 0;
                report.workers.data[workerIndex].rapel = rapelValue;
                report.workers.data[workerIndex].totalUpah = upahValue + rapelValue;
                updatedWorkersCount++;
            }
            // Jika worker tidak ditemukan, skip (tidak membuat data baru)
        });
    } else if (uploadData.uploadType === 'koreksi-massal') {
        // Koreksi: UPDATE data yang sudah ada berdasarkan KODE, ID_PEGAWAI, atau NOMOR_PEGAWAI
        uploadData.data.forEach(row => {
            const kode = row.KODE || row.ID_PEGAWAI || row.NOMOR_PEGAWAI;
            if (!kode) return;

            // Cari worker berdasarkan KODE (bisa dari KPJ, NIK, ID_PEGAWAI, atau no)
            const workerIndex = report.workers.data.findIndex(w => {
                if (w.kpj === kode || w.nik === kode || w.idPegawai === kode || w.kodeTk === kode) {
                    return true;
                }
                if (w.noPegawai && w.noPegawai === kode) {
                    return true;
                }
                if (w.no && String(w.no) === String(kode)) {
                    return true;
                }
                return false;
            });

            if (workerIndex !== -1) {
                const worker = report.workers.data[workerIndex];

                // Update field yang diisi (hanya field yang diizinkan)
                if (row.ALAMAT_LENGKAP_DOMISILI) {
                    worker.alamatLengkapDomisili = row.ALAMAT_LENGKAP_DOMISILI;
                }
                if (row.HANDPHONE) {
                    worker.handphone = row.HANDPHONE;
                }
                if (row.EMAIL) {
                    worker.email = row.EMAIL;
                }
                if (row.LOKASI_PEKERJAAN || row.LOKASI_PEKERJAAN_KODE) {
                    worker.lokasiPekerjaan = row.LOKASI_PEKERJAAN || row.LOKASI_PEKERJAAN_KODE;
                }
                if (row.NAMA_BANK) {
                    worker.namaBank = row.NAMA_BANK;
                }
                if (row.KODE_BANK) {
                    worker.kodeBank = row.KODE_BANK;
                }
                if (row.NOMOR_REKENING) {
                    worker.nomorRekening = row.NOMOR_REKENING;
                }
                if (row.NAMA_REKENING) {
                    worker.namaRekening = row.NAMA_REKENING;
                }

                updatedWorkersCount++;
            }
        });
    }

    // Update summary - hanya hitung workers dengan status AKTIF
    // TK Nonaktif tidak dihitung dalam summary (mengurangi total)
    const aktifWorkers = report.workers.data.filter(w => w.status === 'AKTIF');
    const totalWorkers = aktifWorkers.length;
    const totalUpahRapel = aktifWorkers.reduce((sum, w) => sum + (w.totalUpah || 0), 0);

    report.summary.totalTenagaKerja = totalWorkers;
    report.summary.totalUpahRapel = totalUpahRapel;

    // Recalculate rincian iuran dari active workers
    const reportRiskLevel = report.riskLevel || 'Rendah';
    const contributions = calculateTotalContributions(aktifWorkers, {
        defaultRiskLevel: reportRiskLevel,
    });

    report.summary.totalIuran = contributions.totals.overall;
    report.rincianIuran = [
        {
            program: "JKK",
            label: "IURAN JKK",
            amount: contributions.company.jkk,
            color: "blue",
        },
        {
            program: "JKM",
            label: "IURAN JKM",
            amount: contributions.company.jkm,
            color: "pink",
        },
        {
            program: "JHT",
            label: "IURAN JHT",
            amount: contributions.company.jht + contributions.employee.jht,
            color: "orange",
        },
        {
            program: "JP",
            label: "IURAN JP",
            amount: contributions.company.jp + contributions.employee.jp,
            color: "purple",
        },
    ];

    // Update nomor urut
    report.workers.data.forEach((worker, index) => {
        worker.no = index + 1;
    });

    // Update dashboard history untuk periode ini
    if (data.dashboard && data.dashboard.history && Array.isArray(data.dashboard.history.data)) {
        const historyItem = data.dashboard.history.data.find(
            (item) => item.periode === periodeKey
        );
        if (historyItem) {
            historyItem.jumlahTk = totalWorkers;
            historyItem.nominalIuran = report.summary.totalIuran;
            historyItem.nominalDenda = report.summary.totalDenda || 0;
        }
    }

    // Simpan ke mock data
    setMockData(data);
    persistMockData();

    // Clear cache untuk memastikan data terbaru dimuat saat getReportByPeriode dipanggil
    // Ini akan memaksa reload data dari localStorage yang sudah di-update
    setMockData(null);

    return {
        success: true,
        message: "Data berhasil diintegrasikan",
        newWorkersCount,
        updatedWorkersCount,
        totalWorkers
    };
}
