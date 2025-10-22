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
                <th class="nama-column">Nama</th>
                <th class="kpj-column">KPJ</th>
                <th class="upah-pokok-column">Upah Pokok (Rp)</th>
                <th class="tunjangan-column">Tunjangan (Rp)</th>
                <th class="total-upah-column">Total Upah (Rp)</th>
                <th class="action-column">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in tableData" :key="row.id || idx">
                <td class="nama-column">{{ row.nama }}</td>
                <td class="kpj-column">{{ row.kpj || '-' }}</td>
                <td class="upah-pokok-column">
                  <v-text-field
                    v-model="row.upahPokok"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @blur="updateUpahPokok(row)"
                    class="inline-edit-field"
                  ></v-text-field>
                </td>
                <td class="tunjangan-column">
                  <v-text-field
                    v-model="row.tunjangan"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @blur="updateTunjangan(row)"
                    class="inline-edit-field"
                  ></v-text-field>
                </td>
                <td class="total-upah-column">{{ formatCurrency(row.totalUpah) }}</td>
                <td class="action-column">
                  <v-btn size="small" color="primary" variant="text" icon="mdi-account-edit" @click.stop.prevent="openEditProfile(row)" title="Edit Profil"></v-btn>
                  <v-btn size="small" color="error" variant="text" icon="mdi-delete" @click.stop.prevent="confirmDelete(row)" title="Hapus"></v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
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
              <v-btn color="primary" variant="elevated" @click="confirmYes">Ya</v-btn>
              <v-btn color="grey" variant="outlined" @click="confirmNo">Tidak</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Add Worker Flow Dialog (Step 3) -->
      <v-dialog v-model="dlgAddStep3" max-width="640">
        <v-card class="add-worker-dialog">
          <v-card-text class="text-center pa-6">
            <div class="aw-title">Tambah Tenaga Kerja Individu</div>
            <div class="aw-desc">
              Pekerja Baru yang didaftarkan setelah kejadian meninggal dunia atau kecelakaan kerja,
              maka biaya obat/rawat dan manfaat JKK-JKM lainnya menjadi tanggung jawab pemberi
              kerja.
            </div>
            <v-checkbox class="mt-2" v-model="agreement" label="Saya setuju" />

            <div class="d-flex justify-center gap-4 mt-4 aw-actions">
              <v-btn
                color="success"
                class="aw-btn aw-btn-green"
                :disabled="!agreement"
                @click="confirmAddFromEdit"
              >
                Lanjutkan
              </v-btn>
              <v-btn
                color="error"
                class="aw-btn aw-btn-red"
                variant="elevated"
                @click="dlgAddStep3 = false"
              >
                Cancel
              </v-btn>
            </div>

            <v-alert
              v-if="!agreement"
              type="warning"
              variant="tonal"
              density="comfortable"
              class="mt-4"
            >
              Silakan checklist persetujuan pernyataan terlebih dahulu
            </v-alert>
          </v-card-text>
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

// Iuran cards data
const iuranCards = ref([
  {
    label: 'IURAN JKK',
    value: 'Rp 52.800,00',
    badge: 'JKK',
    badgeClass: 'badge-blue',
    button: null,
  },
  {
    label: 'IURAN JKM',
    value: 'Rp 66.000,00',
    badge: 'JKM',
    badgeClass: 'badge-pink',
    button: null,
  },
  {
    label: 'IURAN JHT',
    value: 'Rp 0,00',
    badge: 'JHT',
    badgeClass: 'badge-orange',
    button: null,
  },
  {
    label: 'IURAN JP',
    value: 'Rp 0,00',
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
    label: 'TK NA Massal',
    icon: 'mdi-account-multiple-minus',
    action: 'upload-tk-na-massal',
    description: 'Upload TK Nonaktif Massal'
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
const itemsPerPage = ref(25)

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
    // Default load semua data (termasuk nonaktif)
    const rows = await apiService.getWorkers()
    allWorkers.value = Array.isArray(rows) ? rows : []
    applyFilter()
  } catch (e) {
    console.error('Gagal memuat workers', e)
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
        worker.statusPegawai !== "NONAKTIF"
      )
      break
    case 'non-aktif':
      filteredWorkers = allWorkers.value.filter(worker => 
        worker.statusPegawai === "NONAKTIF"
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
  tableData.value = filteredWorkers.map((r) => ({
    id: r.id,
    nik: r.nik,
    kpj: r.kpj,
    nama: r.nama,
    upahPokok: r.upahPokok || 0,
    tunjangan: r.tunjangan || 0,
    totalUpah: (r.upahPokok || 0) + (r.tunjangan || 0),
    statusPegawai: r.statusPegawai
  }))
  
  // Update summary cards
  updateSummaryCards(filteredWorkers)

  // Compute iuran summary
  computeIuran(filteredWorkers)
}

// New filter functions
const onStatusChange = (value) => {
  selectedStatus.value = value
  applyFilter()
}

const onSearchChange = () => {
  applyFilter()
}

const onPaginationChange = (value) => {
  itemsPerPage.value = value
  applyFilter()
}

// Inline edit functions
const updateUpahPokok = (row) => {
  row.totalUpah = (row.upahPokok || 0) + (row.tunjangan || 0)
  // Here you would typically save to backend
  console.log('Updated upah pokok for:', row.nama, 'to:', row.upahPokok)
}

const updateTunjangan = (row) => {
  row.totalUpah = (row.upahPokok || 0) + (row.tunjangan || 0)
  // Here you would typically save to backend
  console.log('Updated tunjangan for:', row.nama, 'to:', row.tunjangan)
}

// Format currency helper
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR',
    minimumFractionDigits: 0 
  }).format(amount || 0)
}

// Update summary cards based on filtered data
const updateSummaryCards = (workers) => {
  const totalWorkers = workers.length
  const totalUpah = workers.reduce((sum, worker) => sum + (worker.upah || 0) + (worker.rapel || 0), 0)
  const totalIuran = totalWorkers * 29700 // Rp 29.700 per worker
  const totalDenda = totalIuran * 0.02 // 2% denda
  
  summaryCards.value[0].value = totalWorkers.toString()
  summaryCards.value[1].value = new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR',
    minimumFractionDigits: 2 
  }).format(totalUpah)
  summaryCards.value[2].value = new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR',
    minimumFractionDigits: 2 
  }).format(totalIuran)
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
    const base = Number(w.upah || 0) + Number(w.rapel || 0)
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
    // Fitur 4.1: Upload TK Massal (TK Aktif)
    router.push('/tenaga/upload-tk-massal')
  } else if (action === 'upload-tk-na-massal') {
    // Fitur 4.2: Upload TK Nonaktif Massal
    router.push('/tenaga/upload-tk-na-massal')
  } else if (action === 'upload-upah-massal') {
    // Fitur 4.3: Upload Upah Massal dengan Preview & Log
    router.push('/tenaga/upload-upah-massal')
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
