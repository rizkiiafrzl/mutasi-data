// Mock Data Service untuk E-BPJS Ketenagakerjaan
// Digunakan untuk testing frontend tanpa backend

// Dummy Workers Data - Aktif Workers
export const mockWorkers = [
  {
    id: 1,
    nik: '3201234567890123',
    nama: 'Ahmad Wijaya',
    kpj: '1234567890',
    noPegawai: 'EMP001',
    upah: 5000000,
    rapel: 500000,
    nationality: 'WNI',
    dateOfBirth: '1990-05-15',
    passportNo: '',
    passportValidUntil: '',
    status: 'aktif',
    jenisKelamin: 'Laki-laki',
    upahPokok: 5000000
  },
  {
    id: 2,
    nik: '3201234567890124',
    nama: 'Siti Nurhaliza',
    kpj: '1234567891',
    noPegawai: 'EMP002',
    upah: 4500000,
    rapel: 300000,
    nationality: 'WNI',
    dateOfBirth: '1988-12-20',
    passportNo: '',
    passportValidUntil: '',
    status: 'aktif',
    jenisKelamin: 'Perempuan',
    upahPokok: 4500000
  },
  {
    id: 3,
    nik: '',
    nama: 'John Smith',
    kpj: '',
    noPegawai: 'EMP003',
    upah: 6000000,
    rapel: 0,
    nationality: 'WNA',
    dateOfBirth: '1985-08-10',
    passportNo: 'A1234567',
    passportValidUntil: '2025-12-31',
    status: 'aktif',
    jenisKelamin: 'Laki-laki',
    upahPokok: 6000000
  },
  {
    id: 4,
    nik: '3201234567890125',
    nama: 'Budi Santoso',
    kpj: '1234567892',
    noPegawai: 'EMP004',
    upah: 4000000,
    rapel: 200000,
    nationality: 'WNI',
    dateOfBirth: '1992-03-25',
    passportNo: '',
    passportValidUntil: '',
    status: 'aktif',
    jenisKelamin: 'Laki-laki',
    upahPokok: 4000000
  },
  {
    id: 5,
    nik: '3201234567890126',
    nama: 'Maria Magdalena',
    kpj: '1234567893',
    noPegawai: 'EMP005',
    upah: 5500000,
    rapel: 400000,
    nationality: 'WNI',
    dateOfBirth: '1987-09-18',
    passportNo: '',
    passportValidUntil: '',
    status: 'aktif',
    jenisKelamin: 'Perempuan',
    upahPokok: 5500000
  },
  {
    id: 6,
    nik: '',
    nama: 'Robert Johnson',
    kpj: '',
    noPegawai: 'EMP006',
    upah: 7000000,
    rapel: 0,
    nationality: 'WNA',
    dateOfBirth: '1980-11-22',
    passportNo: 'B9876543',
    passportValidUntil: '2024-08-15',
    status: 'aktif',
    jenisKelamin: 'Laki-laki',
    upahPokok: 7000000
  },
  {
    id: 7,
    nik: '3201234567890127',
    nama: 'Sari Dewi',
    kpj: '1234567894',
    noPegawai: 'EMP007',
    upah: 4200000,
    rapel: 150000,
    nationality: 'WNI',
    dateOfBirth: '1991-07-08',
    passportNo: '',
    passportValidUntil: '',
    status: 'aktif',
    jenisKelamin: 'Perempuan',
    upahPokok: 4200000
  },
  {
    id: 8,
    nik: '3201234567890128',
    nama: 'David Wilson',
    kpj: '1234567895',
    noPegawai: 'EMP008',
    upah: 4800000,
    rapel: 250000,
    nationality: 'WNI',
    dateOfBirth: '1989-04-12',
    passportNo: '',
    passportValidUntil: '',
    status: 'aktif',
    jenisKelamin: 'Laki-laki',
    upahPokok: 4800000
  },
  {
    id: 9,
    nik: '',
    nama: 'Sarah Connor',
    kpj: '',
    noPegawai: 'EMP009',
    upah: 6500000,
    rapel: 0,
    nationality: 'WNA',
    dateOfBirth: '1983-06-30',
    passportNo: 'C5555555',
    passportValidUntil: '2025-03-10',
    status: 'aktif',
    jenisKelamin: 'Perempuan',
    upahPokok: 6500000
  },
  {
    id: 10,
    nik: '3201234567890129',
    nama: 'Indah Sari',
    kpj: '1234567896',
    noPegawai: 'EMP010',
    upah: 3800000,
    rapel: 100000,
    nationality: 'WNI',
    dateOfBirth: '1993-12-05',
    passportNo: '',
    passportValidUntil: '',
    status: 'aktif',
    jenisKelamin: 'Perempuan',
    upahPokok: 3800000
  },
  {
    id: 11,
    nik: '3201234567890130',
    nama: 'Rizki Pratama',
    kpj: '1234567897',
    noPegawai: 'EMP011',
    upah: 5200000,
    rapel: 300000,
    nationality: 'WNI',
    dateOfBirth: '1986-01-15',
    passportNo: '',
    passportValidUntil: '',
    status: 'aktif',
    jenisKelamin: 'Laki-laki',
    upahPokok: 5200000
  },
  {
    id: 12,
    nik: '',
    nama: 'Michael Brown',
    kpj: '',
    noPegawai: 'EMP012',
    upah: 7500000,
    rapel: 0,
    nationality: 'WNA',
    dateOfBirth: '1978-03-20',
    passportNo: 'D7777777',
    passportValidUntil: '2026-01-15',
    status: 'aktif',
    jenisKelamin: 'Laki-laki',
    upahPokok: 7500000
  }
]

// Dummy Nonaktif Workers Data
export const mockNonaktifWorkers = [
  {
    id: 101,
    nik: '3201234567890101',
    nama: 'Lina Susanti',
    kpj: '1234567001',
    noPegawai: 'EMP101',
    upah: 0,
    rapel: 0,
    nationality: 'WNI',
    dateOfBirth: '1985-03-15',
    passportNo: '',
    passportValidUntil: '',
    status: 'nonaktif',
    jenisKelamin: 'Perempuan',
    upahPokok: 0,
    tanggalNonaktif: '2024-06-30',
    alasanNonaktif: 'PHK'
  },
  {
    id: 102,
    nik: '',
    nama: 'James Wilson',
    kpj: '',
    noPegawai: 'EMP102',
    upah: 0,
    rapel: 0,
    nationality: 'WNA',
    dateOfBirth: '1980-11-22',
    passportNo: 'E8888888',
    passportValidUntil: '2024-08-15',
    status: 'nonaktif',
    jenisKelamin: 'Laki-laki',
    upahPokok: 0,
    tanggalNonaktif: '2024-07-15',
    alasanNonaktif: 'Kontrak Berakhir'
  },
  {
    id: 103,
    nik: '3201234567890102',
    nama: 'Dewi Kartika',
    kpj: '1234567002',
    noPegawai: 'EMP103',
    upah: 0,
    rapel: 0,
    nationality: 'WNI',
    dateOfBirth: '1991-07-08',
    passportNo: '',
    passportValidUntil: '',
    status: 'nonaktif',
    jenisKelamin: 'Perempuan',
    upahPokok: 0,
    tanggalNonaktif: '2024-05-20',
    alasanNonaktif: 'Resign'
  },
  {
    id: 104,
    nik: '',
    nama: 'Thomas Anderson',
    kpj: '',
    noPegawai: 'EMP104',
    upah: 0,
    rapel: 0,
    nationality: 'WNA',
    dateOfBirth: '1978-12-03',
    passportNo: 'F9999999',
    passportValidUntil: '2025-03-10',
    status: 'nonaktif',
    jenisKelamin: 'Laki-laki',
    upahPokok: 0,
    tanggalNonaktif: '2024-04-10',
    alasanNonaktif: 'Pensiun'
  },
  {
    id: 105,
    nik: '3201234567890103',
    nama: 'Rina Wulandari',
    kpj: '1234567003',
    noPegawai: 'EMP105',
    upah: 0,
    rapel: 0,
    nationality: 'WNI',
    dateOfBirth: '1987-09-18',
    passportNo: '',
    passportValidUntil: '',
    status: 'nonaktif',
    jenisKelamin: 'Perempuan',
    upahPokok: 0,
    tanggalNonaktif: '2024-03-25',
    alasanNonaktif: 'Meninggal Dunia'
  }
]

// Dummy Report Periods Data
export const mockReportPeriods = [
  {
    id: 1,
    year: 2024,
    month: 7,
    totalTk: 12,
    totalIuran: 356400,
    totalDenda: 70524,
    status: 'Draft'
  },
  {
    id: 2,
    year: 2024,
    month: 6,
    totalTk: 10,
    totalIuran: 297000,
    totalDenda: 58806,
    status: 'Approval'
  },
  {
    id: 3,
    year: 2024,
    month: 5,
    totalTk: 8,
    totalIuran: 237600,
    totalDenda: 0,
    status: 'Posting'
  }
]

// Dummy Upload History Data
export const mockUploadHistory = [
  {
    id: 1,
    totalValid: 15,
    totalInvalid: 2,
    totalData: 17,
    validationStatus: 'Completed',
    validationDate: '2024-07-15 10:30:00',
    dataSource: 'Excel Upload',
    type: 'TK Mendaftar',
    fileName: 'data_tk_juli_2024.xlsx'
  },
  {
    id: 2,
    totalValid: 8,
    totalInvalid: 1,
    totalData: 9,
    validationStatus: 'Completed',
    validationDate: '2024-07-10 14:20:00',
    dataSource: 'Excel Upload',
    type: 'TK Lanjutan',
    fileName: 'data_tk_lanjutan.xlsx'
  },
  {
    id: 3,
    totalValid: 12,
    totalInvalid: 3,
    totalData: 15,
    validationStatus: 'Completed',
    validationDate: '2024-07-05 09:15:00',
    dataSource: 'Excel Upload',
    type: 'Upload Upah',
    fileName: 'data_upah_juli.xlsx'
  },
  {
    id: 4,
    totalValid: 20,
    totalInvalid: 1,
    totalData: 21,
    validationStatus: 'Completed',
    validationDate: '2024-06-28 16:45:00',
    dataSource: 'Excel Upload',
    type: 'TK Massal',
    fileName: 'tk_massal_juni_2024.xlsx'
  },
  {
    id: 5,
    totalValid: 5,
    totalInvalid: 0,
    totalData: 5,
    validationStatus: 'Completed',
    validationDate: '2024-06-25 11:20:00',
    dataSource: 'Excel Upload',
    type: 'Koreksi Data TK',
    fileName: 'koreksi_data_tk.xlsx'
  },
  {
    id: 6,
    totalValid: 18,
    totalInvalid: 2,
    totalData: 20,
    validationStatus: 'Completed',
    validationDate: '2024-06-20 13:30:00',
    dataSource: 'Excel Upload',
    type: 'Upload Upah',
    fileName: 'upah_juni_2024.xlsx'
  },
  {
    id: 7,
    totalValid: 7,
    totalInvalid: 1,
    totalData: 8,
    validationStatus: 'Completed',
    validationDate: '2024-06-15 08:45:00',
    dataSource: 'Excel Upload',
    type: 'TK Nonaktif',
    fileName: 'tk_nonaktif_juni.xlsx'
  },
  {
    id: 8,
    totalValid: 25,
    totalInvalid: 4,
    totalData: 29,
    validationStatus: 'Completed',
    validationDate: '2024-06-10 15:10:00',
    dataSource: 'Excel Upload',
    type: 'TK Massal',
    fileName: 'tk_massal_besar.xlsx'
  }
]

// Dummy Report Summary Data
export const mockReportSummary = {
  kodeTagihan: 'TAG-2024-07',
  totalIuranDanDenda: 142344,
  sisaPembayaranSebelumnya: 0,
  totalTagihan: 142344
}

// Dummy User Data
export const mockUser = {
  id: 1,
  email: 'admin@bpjs.com',
  fullName: 'Administrator BPJS',
  role: 'admin'
}

// Mock API Responses
export const mockApiResponses = {
  // Authentication
  login: {
    token: 'mock-jwt-token-12345',
    user: mockUser,
    message: 'Login berhasil'
  },
  
  register: {
    message: 'Registrasi berhasil',
    user: mockUser
  },
  
  // Workers
  createWorker: (workerData) => ({
    id: Math.floor(Math.random() * 1000) + 100,
    ...workerData,
    message: 'Worker berhasil dibuat'
  }),
  
  updateWorker: (id, workerData) => ({
    id,
    ...workerData,
    message: 'Worker berhasil diupdate'
  }),
  
  deleteWorker: {
    message: 'Worker berhasil dihapus'
  },
  
  // Upload responses
  uploadWorkers: {
    totalData: 10,
    valid: 8,
    invalid: 2,
    message: 'Upload berhasil'
  },
  
  uploadTK: {
    totalData: 15,
    valid: 12,
    invalid: 3,
    message: 'Upload TK berhasil'
  },
  
  uploadUpah: {
    totalData: 20,
    valid: 18,
    invalid: 2,
    message: 'Upload upah berhasil'
  },
  
  koreksiTK: {
    totalData: 5,
    valid: 4,
    invalid: 1,
    message: 'Koreksi data berhasil'
  },
  
  // Report periods
  createReportPeriod: {
    id: Math.floor(Math.random() * 1000) + 200,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    status: 'Draft',
    message: 'Periode pelaporan berhasil dibuat'
  },
  
  deleteReportPeriod: {
    message: 'Periode pelaporan berhasil dihapus'
  },
  
  calculateReportPeriod: {
    message: 'Perhitungan iuran berhasil'
  },
  
  finalizeReportPeriod: {
    message: 'Finalisasi periode berhasil'
  },
  
  printReportPeriod: {
    message: 'Laporan siap dicetak'
  },
  
  // Health check
  healthCheck: {
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  }
}

// Utility functions
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const simulateApiCall = async (response, delayMs = 500) => {
  await delay(delayMs)
  return response
}

export const simulateError = (message = 'Mock error occurred') => {
  throw new Error(message)
}

