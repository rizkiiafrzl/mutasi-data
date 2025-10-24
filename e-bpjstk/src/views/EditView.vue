<template>
  <div class="edit-container">
    <!-- Page Header -->
    <div class="header">
      <div class="header-text">
        <h1>Dashboard Periode Pelaporan</h1>
        <p>{{ currentMonthYear }}</p>
      </div>
      <div class="header-actions">
        <button
          @click="goToDashboard"
          class="back-btn"
        >
          <v-icon>mdi-arrow-left</v-icon>
          Kembali ke Dashboard
        </button>
      </div>
    </div>

      <!-- Summary Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">{{ summaryCards[0].value }}</div>
        <div class="stat-label">{{ summaryCards[0].label }}</div>
      </div>

      <div class="financial-card">
        <div class="financial-amount neutral">{{ summaryCards[1].value }}</div>
        <div class="financial-label">{{ summaryCards[1].label }}</div>
                </div>

      <div class="financial-card">
        <div class="financial-amount negative">{{ summaryCards[2].value }}</div>
        <div class="financial-label">{{ summaryCards[2].label }}</div>
                </div>

      <div class="financial-card">
        <div class="financial-amount negative">{{ summaryCards[3].value }}</div>
        <div class="financial-label">{{ summaryCards[3].label }}</div>
        <button class="detail-btn" @click="handleDetailClick">Detail</button>
              </div>
    </div>

    <!-- Program Contribution Section -->
    <div class="iuran-section">
      <h2 class="iuran-title">Rincian Iuran per Program</h2>
      <div class="iuran-grid">
        <div class="iuran-item" v-for="(iuran, index) in iuranCards" :key="index">
          <div class="iuran-header">
            <div class="iuran-icon" :class="iuran.badgeClass">{{ iuran.badge }}</div>
            <div class="iuran-name">{{ iuran.label }}</div>
          </div>
          <div class="iuran-amount">{{ iuran.value }}</div>
          <button v-if="iuran.button" class="kartu-btn" @click="handleKartuClick">{{ iuran.button }}</button>
        </div>
      </div>
    </div>

      <!-- Pengelolaan Periode Section -->
    <div class="pengelolaan-section">
      <h2 class="pengelolaan-title">Pengelolaan Periode Pelaporan Bulan Juli 2025</h2>

              <!-- Action Buttons -->
              <div class="action-buttons-container">
        <template v-for="(btn, index) in actionButtons" :key="index">
          <!-- Regular Button -->
                <v-btn
            v-if="!btn.hasDropdown"
                  :color="btn.color"
                  variant="elevated"
                  :prepend-icon="btn.icon"
                  class="action-btn"
                  @click="handleActionClick(btn.action)"
                >
                  {{ btn.label }}
                </v-btn>
          
          <!-- Upload Massal Button with Dropdown -->
          <v-menu v-else>
            <template v-slot:activator="{ props }">
              <v-btn
                :color="btn.color"
                variant="elevated"
                :prepend-icon="btn.icon"
                class="action-btn"
                v-bind="props"
              >
                {{ btn.label }}
                <v-icon>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="(option, optionIndex) in uploadOptions"
                :key="optionIndex"
                @click="handleUploadOption(option.action)"
                class="upload-option-item"
              >
                <template v-slot:prepend>
                  <v-icon>{{ option.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ option.label }}</v-list-item-title>
                <v-list-item-subtitle>{{ option.description }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
              </div>

      <!-- Tab Navigation -->
      <div class="tab-navigation mb-4">
                  <v-btn
          :color="activeTab === 'daftar' ? 'success' : 'grey'"
          :variant="activeTab === 'daftar' ? 'elevated' : 'outlined'"
          class="tab-btn"
          @click="activeTab = 'daftar'"
        >
          Daftar TK
        </v-btn>
        <v-btn
          :color="activeTab === 'ringkasan' ? 'success' : 'grey'"
          :variant="activeTab === 'ringkasan' ? 'elevated' : 'outlined'"
          class="tab-btn"
          @click="activeTab = 'ringkasan'"
        >
          Ringkasan Iuran
        </v-btn>
      </div>

      <!-- Daftar TK Tab Content -->
      <div v-if="activeTab === 'daftar'">
        <!-- Enhanced Filter and Search -->
        <div class="d-flex align-center justify-center mb-6 filter-search-container">
          <div class="d-flex align-center gap-3 flex-wrap">
            <!-- Status Filter -->
                  <v-select
              :items="statusOptions"
                    density="comfortable"
                    hide-details
                    variant="outlined"
                    class="filter-select"
              v-model="selectedStatus"
              @update:model-value="onStatusChange"
              label="Status"
              style="min-width: 150px;"
                  ></v-select>
            
            <!-- Search Field -->
                  <v-text-field
              v-model="searchQuery"
              placeholder="Cari NIK/Nama/KPJ..."
                    density="comfortable"
                    hide-details
                    variant="outlined"
                    class="search-field"
              prepend-inner-icon="mdi-magnify"
              @input="onSearchChange"
              style="min-width: 200px;"
                  ></v-text-field>
            
            <!-- Items Per Page -->
            <v-select
              :items="paginationOptions"
              density="comfortable"
              hide-details
              variant="outlined"
              class="pagination-select"
              v-model="itemsPerPage"
              @update:model-value="onPaginationChange"
              label="Tampilkan"
              style="min-width: 100px;"
            ></v-select>
            
            <!-- Refresh Button -->
                  <v-btn
                    color="primary"
              variant="outlined"
              prepend-icon="mdi-refresh"
              class="filter-btn"
                    size="default"
              @click="loadWorkers"
            >
              Refresh
            </v-btn>
                </div>
              </div>

              <!-- Data Table -->
              <div class="table-responsive table-container">
                <v-table class="data-table" density="comfortable">
                  <thead>
                    <tr>
                <th class="no-column">No</th>
                      <th class="nik-column">NIK</th>
                      <th class="nama-column">Nama</th>
                <th class="jk-column">JK</th>
                <th class="kpj-column">KPJ</th>
                <th class="upah-pokok-column">Upah Pokok</th>
                <th class="rapel-column">Rapel</th>
                <th class="total-upah-column">Total Upah</th>
                <th class="status-column">Status</th>
                      <th class="action-column">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in tableData" :key="row.id || idx">
                <td class="no-column">{{ idx + 1 }}</td>
                <td class="nik-column">{{ row.nik || '-' }}</td>
                      <td class="nama-column">{{ row.nama }}</td>
                <td class="jk-column">{{ row.jenisKelamin || '-' }}</td>
                <td class="kpj-column">{{ row.kpj || '-' }}</td>
                <td class="upah-pokok-column">
                  <span v-if="!row.isEditing" @click="startEdit(row)" class="editable-text">
                    {{ formatNumber(row.upahPokok) }}
                  </span>
                  <v-text-field
                    v-else
                    v-model="row.upahPokok"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @blur="finishEdit(row)"
                    @keyup.enter="finishEdit(row)"
                    class="inline-edit-field"
                    autofocus
                  ></v-text-field>
                </td>
                <td class="rapel-column">
                  <span v-if="!row.isEditing" @click="startEdit(row)" class="editable-text">
                    {{ formatNumber(row.rapel) }}
                  </span>
                  <v-text-field
                    v-else
                    v-model="row.rapel"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @blur="finishEdit(row)"
                    @keyup.enter="finishEdit(row)"
                    class="inline-edit-field"
                    autofocus
                  ></v-text-field>
                </td>
                <td class="total-upah-column total-upah-value">{{ formatCurrency(row.totalUpah) }}</td>
                <td class="status-column">
                  <v-chip 
                    :color="row.statusPegawai === 'NONAKTIF' ? 'error' : 'success'" 
                    size="small" 
                    variant="tonal"
                  >
                    {{ row.statusPegawai === 'NONAKTIF' ? 'Non Aktif' : 'Aktif' }}
                  </v-chip>
                </td>
                      <td class="action-column">
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-btn
                        size="small"
                        color="grey"
                        variant="text"
                        icon="mdi-dots-vertical"
                        v-bind="props"
                        @click.stop.prevent
                      ></v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="openEditProfile(row)">
                        <template v-slot:prepend>
                          <v-icon>mdi-pencil</v-icon>
                        </template>
                        <v-list-item-title>Edit Profil</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="handlePayment(row)">
                        <template v-slot:prepend>
                          <v-icon>mdi-eye</v-icon>
                        </template>
                        <v-list-item-title>Lihat Detail</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="confirmDelete(row)" class="text-error">
                        <template v-slot:prepend>
                          <v-icon color="error">mdi-delete</v-icon>
                        </template>
                        <v-list-item-title>Hapus</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                      </td>
              </tr>
            </tbody>
          </v-table>
          
          <!-- Pagination Info -->
          <div class="pagination-info">
            Menampilkan {{ ((currentPage - 1) * itemsPerPage) + 1 }}-{{ Math.min(currentPage * itemsPerPage, paginatedData.length) }} dari {{ paginatedData.length }} data
          </div>
        </div>
      </div>

      <!-- Ringkasan Iuran Tab Content -->
      <div v-if="activeTab === 'ringkasan'">
        <v-table density="comfortable" class="iuran-table">
          <thead>
            <tr>
              <th style="width:56px;">No</th>
              <th>Nama TK</th>
              <th>JHT (2%)</th>
              <th>JP (1%)</th>
              <th>JKK (0.1%)</th>
              <th>JKM (0.03%)</th>
              <th>JKP (1%)</th>
              <th>Total iuran</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in iuranRows" :key="row.id || idx">
              <td>{{ idx + 1 }}</td>
              <td>{{ row.nama }}</td>
              <td>{{ row.jht }}</td>
              <td>{{ row.jp }}</td>
              <td>{{ row.jkk }}</td>
              <td>{{ row.jkm }}</td>
              <td>{{ row.jkp }}</td>
              <td class="text-success font-weight-bold">{{ row.total }}</td>
            </tr>
            <tr class="iuran-total-row">
              <td colspan="2" class="font-weight-bold">TOTAL</td>
              <td class="font-weight-bold">{{ totals.jht }}</td>
              <td class="font-weight-bold">{{ totals.jp }}</td>
              <td class="font-weight-bold">{{ totals.jkk }}</td>
              <td class="font-weight-bold">{{ totals.jkm }}</td>
              <td class="font-weight-bold">{{ totals.jkp }}</td>
              <td class="text-success font-weight-bold">{{ totals.total }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </div>

              <!-- Edit Dialog -->
              <v-dialog v-model="editing" max-width="520">
                <v-card>
                  <v-card-title>Edit Data Karyawan</v-card-title>
                  <v-card-text>
                    <v-text-field v-model="editItem.nik" label="NIK" variant="outlined" />
                    <v-text-field v-model="editItem.kpj" label="KPJ" variant="outlined" />
                    <v-text-field v-model="editItem.noPegawai" label="No Pegawai" variant="outlined" />
                    <v-text-field v-model="editItem.nama" label="Nama" variant="outlined" />
                    <v-text-field v-model.number="editItem.upah" label="Upah" variant="outlined" type="number" />
                    <v-text-field v-model.number="editItem.rapel" label="Rapel" variant="outlined" type="number" />
                  </v-card-text>
                  <v-card-actions class="justify-end">
                    <v-btn variant="text" @click="editing = false">Batal</v-btn>
                    <v-btn color="primary" @click="saveEdit">Simpan</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>

              <!-- Table Footer -->
              <div class="d-flex justify-space-between align-center mt-6 table-footer">
                <div class="text-caption text-grey-darken-1">Showing 10 entries</div>
                <div class="text-caption text-grey-darken-1">2018 © BPJS Ketenagakerjaan.</div>
              </div>

      <!-- Notification Modal -->
      <v-dialog v-model="showNotificationModal" persistent max-width="500">
        <v-card>
          <v-card-text class="text-center pa-6">
            <div class="notification-icon mb-4">
              <v-icon color="primary" size="48">mdi-information</v-icon>
            </div>
            <div class="text-h6 font-weight-bold mb-3">Pemberitahuan</div>
            <div class="text-body-1 mb-4 text-left">
              Harap cek kembali! Jika Pekerja belum berhenti bekerja/PHK, pastikan Pekerja tersebut
              masih mendapatkan perlindungan jamsostek. Jika memerlukan informasi atau pertanyaan
              lebih lanjut agar menghubungi Petugas BP Jamsostek di Kantor Cabang terdaftar.
            </div>
            <div class="d-flex justify-center">
              <v-btn color="primary" variant="elevated" @click="closeNotification">OK</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Confirmation Modal -->
      <v-dialog v-model="showConfirmationModal" persistent max-width="400">
        <v-card>
          <v-card-text class="text-center pa-6">
            <div class="confirmation-icon mb-4">
              <v-icon color="primary" size="48">mdi-help-circle</v-icon>
            </div>
            <div class="text-h6 font-weight-bold mb-3">Konfirmasi</div>
            <div class="text-body-1 mb-4">Apakah PK/BU ada perubahan data?</div>
            <div class="d-flex justify-center gap-3">
              <v-btn 
                color="primary" 
                variant="elevated" 
                @click="confirmYes"
                size="default"
                class="confirmation-btn"
                min-width="80"
              >
                Ya
              </v-btn>
              <v-btn 
                color="grey" 
                variant="outlined" 
                @click="confirmNo"
                size="default"
                class="confirmation-btn"
                min-width="80"
              >
                Tidak
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Add Worker Flow Dialog (Step 3) -->
      <v-dialog v-model="dlgAddStep3" max-width="480" persistent>
        <v-card class="add-worker-dialog">
          <v-card-title class="text-center pa-4 pb-3">
            <div class="text-h6 font-weight-bold text-grey-darken-3">
              Tambah Tenaga Kerja Individu
            </div>
          </v-card-title>
          
          <v-card-text class="pa-5 pt-2">
            <div class="text-center mb-5">
              <v-icon color="info" size="40" class="mb-4">mdi-information-outline</v-icon>
              <div class="text-body-2 text-grey-darken-2 line-height-1-6 px-2">
              Pekerja Baru yang didaftarkan setelah kejadian meninggal dunia atau kecelakaan kerja,
                maka biaya obat/rawat dan manfaat JKK-JKM lainnya menjadi tanggung jawab pemberi kerja.
            </div>
            </div>

            <div class="d-flex align-center justify-center mb-5">
              <v-checkbox 
                v-model="agreement" 
                label="Saya setuju dengan pernyataan di atas"
                color="success"
                hide-details
                class="agreement-checkbox"
                density="compact"
              />
            </div>

            <v-alert
              v-if="!agreement"
              type="warning"
              variant="tonal"
              density="compact"
              class="mb-4"
              icon="mdi-alert-circle"
            >
              Silakan checklist persetujuan pernyataan terlebih dahulu
            </v-alert>
          </v-card-text>

          <v-card-actions class="pa-5 pt-2">
            <v-spacer></v-spacer>
            <v-btn
              color="grey"
              variant="outlined"
              size="default"
              @click="dlgAddStep3 = false"
              class="mr-3"
            >
              Batal
            </v-btn>
            <v-btn
              color="success"
              variant="elevated"
              size="default"
              :disabled="!agreement"
              @click="confirmAddFromEdit"
              class="px-4"
            >
              <v-icon left size="small">mdi-arrow-right</v-icon>
              Lanjutkan
            </v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Modal state
const showNotificationModal = ref(false)
const showConfirmationModal = ref(false)

// Summary cards data
const summaryCards = ref([
  {
    value: '4',
    label: 'TOTAL TENAGA KERJA',
    colorClass: 'text-red',
    button: null,
  },
  {
    value: 'Rp. 22.000.000,00',
    label: 'TOTAL UPAH + RAPEL',
    colorClass: 'text-grey-darken-2',
    button: null,
  },
  {
    value: 'Rp. 118.800,00',
    label: 'TOTAL IURAN',
    colorClass: 'text-red',
    button: null,
  },
  {
    value: 'Rp. 23.544,00',
    label: 'TOTAL DENDA',
    colorClass: 'text-red',
    button: 'DETAIL',
  },
])

// Iuran cards data - will be updated dynamically
const iuranCards = ref([
  {
    label: 'IURAN JKK',
    value: 'Rp 0',
    badge: 'JKK',
    badgeClass: 'badge-blue',
    button: null,
  },
  {
    label: 'IURAN JKM',
    value: 'Rp 0',
    badge: 'JKM',
    badgeClass: 'badge-pink',
    button: null,
  },
  {
    label: 'IURAN JHT',
    value: 'Rp 0',
    badge: 'JHT',
    badgeClass: 'badge-orange',
    button: null,
  },
  {
    label: 'IURAN JP',
    value: 'Rp 0',
    badge: 'JP',
    badgeClass: 'badge-purple',
    button: 'KARTU ANGSURAN',
  },
])

// Action buttons data - Updated with single upload button
const actionButtons = ref([
  {
    label: 'TAMBAH TK',
    color: 'success',
    icon: 'mdi-plus',
    action: 'tambah-tk',
    description: 'Tambah TK Individu (Manual Input)'
  },
  {
    label: 'UPLOAD MASSAL',
    color: 'primary',
    icon: 'mdi-upload',
    action: 'upload-massal',
    description: 'Upload Massal - Pilih Jenis Upload',
    hasDropdown: true
  },
  {
    label: 'HITUNG IURAN',
    color: 'success',
    icon: 'mdi-calculator',
    action: 'hitung-iuran',
    description: 'Preview Perhitungan Iuran'
  },
  {
    label: 'FINALISASI',
    color: 'error',
    icon: 'mdi-check',
    action: 'finalisasi',
    description: 'Finalisasi Periode dengan Checklist'
  },
])

// Upload options for dropdown
const uploadOptions = ref([
  {
    label: 'TK Massal',
    icon: 'mdi-account-multiple-plus',
    action: 'upload-tk-massal',
    description: 'Upload TK Aktif Massal'
  },
  {
    label: 'Upah Massal',
    icon: 'mdi-cash-multiple',
    action: 'upload-upah-massal',
    description: 'Upload Upah Massal dengan Preview & Log'
  }
])

// Table data dari API workers
import apiService from '../services/api.js'
const tableData = ref([])
const allWorkers = ref([]) // Store all workers data
const editing = ref(false)
const editItem = ref({ id: null, nik: '', kpj: '', noPegawai: '', nama: '', upah: 0, rapel: 0 })

// Tab state
const activeTab = ref('daftar')

// Enhanced filter state according to new specifications
const selectedStatus = ref('aktif')
const searchQuery = ref('')
const itemsPerPage = ref(10) // Changed default to 10
const currentPage = ref(1) // Add current page tracking
const paginatedData = ref([]) // Add paginated data

const statusOptions = [
  { title: 'Semua Status', value: 'semua' },
  { title: 'Peserta Aktif', value: 'aktif' },
  { title: 'Peserta Non Aktif', value: 'non-aktif' }
]

const paginationOptions = [
  { title: '10', value: 10 },
  { title: '25', value: 25 },
  { title: '50', value: 50 },
  { title: '100', value: 100 }
]

// Load workers data
const loadWorkers = async () => {
  try {
    // Load semua data (aktif + nonaktif)
    const rows = await apiService.getAllWorkers()
    allWorkers.value = Array.isArray(rows) ? rows : []
    
    console.log('Loaded workers:', allWorkers.value.length)
    console.log('Aktif workers:', allWorkers.value.filter(w => w.status === 'aktif').length)
    console.log('Nonaktif workers:', allWorkers.value.filter(w => w.status === 'nonaktif').length)
    
    // Add sample data if no data from API
    if (allWorkers.value.length === 0) {
      allWorkers.value = [
        {
          id: 1,
          nik: '3201234567890123',
          nama: 'Ahmad Wijaya',
          jenisKelamin: 'Laki-laki',
          kpj: '1234567890',
          upahPokok: 5000000,
          rapel: 500000,
          statusPegawai: 'AKTIF',
          status: 'aktif'
        },
        {
          id: 2,
          nik: '3201234567890124',
          nama: 'Siti Nurhaliza',
          jenisKelamin: 'Perempuan',
          kpj: '1234567891',
          upahPokok: 4500000,
          rapel: 300000,
          statusPegawai: 'AKTIF',
          status: 'aktif'
        },
        {
          id: 3,
          nik: '',
          nama: 'John Smith',
          jenisKelamin: 'Laki-laki',
          kpj: '',
          upahPokok: 6000000,
          rapel: 0,
          statusPegawai: 'AKTIF',
          status: 'aktif',
          passportNo: 'A1234567'
        },
        {
          id: 101,
          nik: '3201234567890101',
          nama: 'Lina Susanti',
          jenisKelamin: 'Perempuan',
          kpj: '1234567001',
          upahPokok: 0,
          rapel: 0,
          statusPegawai: 'NONAKTIF',
          status: 'nonaktif',
          tanggalNonaktif: '2024-06-30',
          alasanNonaktif: 'PHK'
        },
        {
          id: 102,
          nik: '',
          nama: 'James Wilson',
          jenisKelamin: 'Laki-laki',
          kpj: '',
          upahPokok: 0,
          rapel: 0,
          statusPegawai: 'NONAKTIF',
          status: 'nonaktif',
          passportNo: 'E8888888',
          tanggalNonaktif: '2024-07-15',
          alasanNonaktif: 'Kontrak Berakhir'
        }
      ]
    }
    
    applyFilter()
  } catch (e) {
    console.error('Gagal memuat workers', e)
    // Fallback to sample data with both aktif and nonaktif
    allWorkers.value = [
      {
        id: 1,
        nik: '3201234567890123',
        nama: 'Ahmad Wijaya',
        jenisKelamin: 'Laki-laki',
        kpj: '1234567890',
        upahPokok: 5000000,
        rapel: 500000,
        statusPegawai: 'AKTIF',
        status: 'aktif'
      },
      {
        id: 2,
        nik: '3201234567890124',
        nama: 'Siti Nurhaliza',
        jenisKelamin: 'Perempuan',
        kpj: '1234567891',
        upahPokok: 4500000,
        rapel: 300000,
        statusPegawai: 'AKTIF',
        status: 'aktif'
      },
      {
        id: 3,
        nik: '',
        nama: 'John Smith',
        jenisKelamin: 'Laki-laki',
        kpj: '',
        upahPokok: 6000000,
        rapel: 0,
        statusPegawai: 'AKTIF',
        status: 'aktif',
        passportNo: 'A1234567'
      },
      {
        id: 101,
        nik: '3201234567890101',
        nama: 'Lina Susanti',
        jenisKelamin: 'Perempuan',
        kpj: '1234567001',
        upahPokok: 0,
        rapel: 0,
        statusPegawai: 'NONAKTIF',
        status: 'nonaktif',
        tanggalNonaktif: '2024-06-30',
        alasanNonaktif: 'PHK'
      },
      {
        id: 102,
        nik: '',
        nama: 'James Wilson',
        jenisKelamin: 'Laki-laki',
        kpj: '',
        upahPokok: 0,
        rapel: 0,
        statusPegawai: 'NONAKTIF',
        status: 'nonaktif',
        passportNo: 'E8888888',
        tanggalNonaktif: '2024-07-15',
        alasanNonaktif: 'Kontrak Berakhir'
      }
    ]
    applyFilter()
  }
}

// Enhanced filter and search functions
const applyFilter = () => {
  let filteredWorkers = [...allWorkers.value]
  
  // Apply status filter
  switch (selectedStatus.value) {
    case 'semua':
      filteredWorkers = allWorkers.value
      break
    case 'aktif':
      filteredWorkers = allWorkers.value.filter(worker => 
        worker.statusPegawai !== "NONAKTIF" && worker.status !== "nonaktif"
      )
      break
    case 'non-aktif':
      filteredWorkers = allWorkers.value.filter(worker => 
        worker.statusPegawai === "NONAKTIF" || worker.status === "nonaktif"
      )
      break
    default:
      filteredWorkers = allWorkers.value
  }
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filteredWorkers = filteredWorkers.filter(worker => 
      worker.nik?.toLowerCase().includes(query) ||
      worker.nama?.toLowerCase().includes(query) ||
      worker.kpj?.toLowerCase().includes(query)
    )
  }
  
  // Format data for table display with new structure
  const formattedData = filteredWorkers.map((r) => {
    const upahPokok = r.upahPokok || r.upah || 0
    const rapel = r.rapel || 0
    
    // Apply multiplier for display (like in the image: 1050 becomes 10.500.000)
    let totalUpah = upahPokok + rapel
    
    return {
      id: r.id,
      nik: r.nik,
      kpj: r.kpj,
      nama: r.nama,
      jenisKelamin: r.jenisKelamin || r.jk,
      upahPokok: upahPokok,
      rapel: rapel,
      totalUpah: totalUpah,
      statusPegawai: r.statusPegawai || (r.status === 'nonaktif' ? 'NONAKTIF' : 'AKTIF'),
      isEditing: false
    }
  })
  
  // Apply pagination
  const startIndex = (currentPage.value - 1) * itemsPerPage.value
  const endIndex = startIndex + itemsPerPage.value
  tableData.value = formattedData.slice(startIndex, endIndex)
  paginatedData.value = formattedData // Store all filtered data for reference
  
  // Compute iuran summary first
  computeIuran(formattedData)

  // Update summary cards with real data
  updateSummaryCards(formattedData)
}

// New filter functions
const onStatusChange = (value) => {
  selectedStatus.value = value
  currentPage.value = 1 // Reset to first page when status changes
  applyFilter()
}

const onSearchChange = () => {
  currentPage.value = 1 // Reset to first page when search changes
  applyFilter()
}

const onPaginationChange = (value) => {
  itemsPerPage.value = value
  currentPage.value = 1 // Reset to first page when pagination changes
  applyFilter()
}

// Inline edit functions
const updateUpahPokok = (row) => {
  const upahPokok = row.upahPokok || 0
  const rapel = row.rapel || 0
  
  // Apply multiplier for display (like in the image: 1050 becomes 10.500.000)
  let totalUpah = upahPokok + rapel
  if (upahPokok > 100) {
    totalUpah = upahPokok * 10000 // Multiply by 10,000 for larger values
  }
  
  row.totalUpah = totalUpah
  // Here you would typically save to backend
  console.log('Updated upah pokok for:', row.nama, 'to:', row.upahPokok)
}


// Format currency helper
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR',
    minimumFractionDigits: 0 
  }).format(amount || 0)
}

// Format number helper (without currency symbol)
const formatNumber = (amount) => {
  return new Intl.NumberFormat('id-ID', { 
    minimumFractionDigits: 0 
  }).format(amount || 0)
}

// Start editing mode
const startEdit = (row) => {
  row.isEditing = true
}

// Finish editing mode
const finishEdit = (row) => {
  row.isEditing = false
  updateUpahPokok(row)
}


// Handle payment action
const handlePayment = (row) => {
  console.log('Payment clicked for:', row.nama)
  // Implementation for payment functionality
}

// Update summary cards based on filtered data
const updateSummaryCards = (workers) => {
  const totalWorkers = workers.length
  const totalUpah = workers.reduce((sum, worker) => sum + (worker.upahPokok || worker.upah || 0) + (worker.rapel || 0), 0)
  
  // Use real iuran total from computeIuran instead of dummy calculation
  const totalIuran = totals.value.total || 'Rp 0'
  const totalDenda = totals.value.total ? parseFloat(totals.value.total.replace(/[^\d]/g, '')) * 0.02 : 0
  
  summaryCards.value[0].value = totalWorkers.toString()
  summaryCards.value[1].value = new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR',
    minimumFractionDigits: 2 
  }).format(totalUpah)
  summaryCards.value[2].value = totalIuran // Use real total from computeIuran
  summaryCards.value[3].value = new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR',
    minimumFractionDigits: 2 
  }).format(totalDenda)
}

// Iuran rows & totals
const iuranRows = ref([])
const totals = ref({ jht: 'Rp 0', jp: 'Rp 0', jkk: 'Rp 0', jkm: 'Rp 0', jkp: 'Rp 0', total: 'Rp 0' })

const currency = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Math.round(n || 0))

const computeIuran = (workers) => {
  // Rates
  const RATE_JHT = 0.02
  const RATE_JP  = 0.01
  const RATE_JKK = 0.001
  const RATE_JKM = 0.0003
  const RATE_JKP = 0.01

  let sumJht = 0, sumJp = 0, sumJkk = 0, sumJkm = 0, sumJkp = 0, sumTotal = 0

  iuranRows.value = workers.map(w => {
    const base = Number(w.upahPokok || w.upah || 0) + Number(w.rapel || 0)
    const jht = base * RATE_JHT
    const jp  = base * RATE_JP
    const jkk = base * RATE_JKK
    const jkm = base * RATE_JKM
    const jkp = base * RATE_JKP
    const total = jht + jp + jkk + jkm + jkp

    sumJht += jht; sumJp += jp; sumJkk += jkk; sumJkm += jkm; sumJkp += jkp; sumTotal += total

    return {
      id: w.id,
      nama: w.nama,
      jht: currency(jht),
      jp: currency(jp),
      jkk: currency(jkk),
      jkm: currency(jkm),
      jkp: currency(jkp),
      total: currency(total),
    }
  })

  totals.value = {
    jht: currency(sumJht),
    jp: currency(sumJp),
    jkk: currency(sumJkk),
    jkm: currency(sumJkm),
    jkp: currency(sumJkp),
    total: currency(sumTotal),
  }

  // Update iuran cards with real data
  updateIuranCards()
}

// Function to update iuran cards with real data from totals
const updateIuranCards = () => {
  iuranCards.value[0].value = totals.value.jkk  // JKK
  iuranCards.value[1].value = totals.value.jkm  // JKM  
  iuranCards.value[2].value = totals.value.jht  // JHT
  iuranCards.value[3].value = totals.value.jp   // JP
}

// Handle filter change - removed as we now use separate functions

onMounted(async () => {
  // Load workers data immediately
  await loadWorkers()
  // Show notification modal after data is loaded
  showNotificationModal.value = true
})

// openEdit function removed - replaced with openEditProfile

const saveEdit = async () => {
  try {
    await apiService.updateWorker(editItem.value.id, {
      nik: editItem.value.nik,
      kpj: editItem.value.kpj,
      noPegawai: editItem.value.noPegawai,
      nama: editItem.value.nama,
      upah: editItem.value.upah,
      rapel: editItem.value.rapel,
    })
    await loadWorkers()
    editing.value = false
  } catch (e) {
    alert(e?.message || 'Gagal menyimpan perubahan')
  }
}

const confirmDelete = async (row) => {
  if (!confirm('Hapus data karyawan ini?')) return
  try {
    await apiService.deleteWorker(row.id)
    await loadWorkers() // Reload data and apply current filter
  } catch (e) {
    alert(e?.message || 'Gagal menghapus data')
  }
}

const handleDetailClick = () => {
  console.log('Detail clicked')
}

const handleKartuClick = () => {
  console.log('Kartu Angsuran clicked')
}

const handleActionClick = (action) => {
  console.log('Action clicked:', action)
  if (action === 'tambah-tk') {
    // Fitur 3.2: Tambah TK Individu (Manual Input)
    openAddWorkerFlow()
  } else if (action === 'hitung-iuran') {
    // Fitur 5.2: Preview Perhitungan Iuran
    router.push('/tenaga/hitung-iuran')
  } else if (action === 'finalisasi') {
    // Fitur 2.2: Finalisasi Periode dengan Checklist
    openFinalisasiDialog()
  }
}

// Handle upload option selection
const handleUploadOption = (action) => {
  console.log('Upload option selected:', action)
  if (action === 'upload-tk-massal') {
    // Arahkan ke halaman upload massal TK yang lama (saat masih di TAMBAH TK)
    router.push('/tenaga/upload')
  } else if (action === 'upload-upah-massal') {
    // Upload Upah Massal dengan Preview & Log
    router.push('/tenaga/upload-upah')
  }
}

// Dialog functions

const openFinalisasiDialog = () => {
  // This would open finalisasi dialog with checklist validation
  console.log('Opening finalisasi dialog with checklist')
  // Implementation would show validation checklist
}

const openEditProfile = (row) => {
  // Fitur 3.4: Edit Profil TK (NIK dan KPJ read-only)
  console.log('Opening edit profile for:', row.nama)
  router.push(`/tenaga/edit-profile/${row.id}`)
}

// Add worker popup flow (Step 3 only here)
const dlgAddStep3 = ref(false)
const agreement = ref(false)
const addType = ref(null)

const router = useRouter()

// Header month text (e.g., Juli 2025)
const currentMonthYear = ref('Juli 2025')

const openAddWorkerFlow = () => {
  agreement.value = false
  addType.value = 'individu' // Set langsung ke individu
  dlgAddStep3.value = true
}

const confirmAddFromEdit = () => {
  if (!agreement.value) return
  dlgAddStep3.value = false
  window.scrollTo(0, 0)
  // Langsung ke halaman tambah individu
  router.push('/tenaga/tambah')
}

const closeNotification = () => {
  showNotificationModal.value = false
  // Show confirmation modal after notification is closed
  showConfirmationModal.value = true
}

const confirmYes = () => {
  showConfirmationModal.value = false
  console.log('User confirmed: Yes')
}

const confirmNo = () => {
  showConfirmationModal.value = false
  console.log('User confirmed: No')
}

const goToDashboard = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
@import '@/assets/css/edit-view.css';
</style>

