<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <v-icon color="primary" size="24" class="mr-2">mdi-chart-line</v-icon>
          <h1 class="header-title">Mutasi Data Laporan</h1>
        </div>
        <div class="header-right">
          <span class="user-info">{{ userEmail }}</span>
          <v-btn @click="handleLogout" color="error" variant="text" size="small" class="ml-2">
            <v-icon left>mdi-logout</v-icon>
            Logout
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Welcome Card -->
      <v-card class="welcome-card" elevation="2">
        <v-card-text class="text-center pa-8">
          <h2 class="welcome-title mb-4">Selamat Datang!</h2>
          <p class="welcome-subtitle mb-6">
            Silakan buat laporan baru atau lanjutkan laporan yang masih draft.
          </p>
          <v-btn 
            color="success" 
            variant="elevated" 
            size="large"
            prepend-icon="mdi-plus"
            @click="addPeriod"
            class="create-btn"
          >
            {{ buttonText }}
          </v-btn>
        </v-card-text>
      </v-card>

      <!-- Report History Card -->
      <v-card class="history-card" elevation="2">
        <v-card-title class="history-title">
          Riwayat Laporan Anda:
        </v-card-title>
        
        <v-card-text class="pa-0">
          <v-table class="history-table" density="comfortable">
            <thead>
              <tr>
                <th class="text-left">PERIODE</th>
                <th class="text-center">STATUS</th>
                <th class="text-center">AKSI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in reportRows" :key="row.id || idx">
                <td class="period-cell">
                  {{ getMonthName(row.month) }} {{ row.year }}
                </td>
                <td class="text-center">
                  <v-chip 
                    :color="getStatusColor(row.status)" 
                    size="small" 
                    variant="elevated"
                    class="status-chip"
                  >
                    {{ getStatusText(row.status) }}
                  </v-chip>
                </td>
                <td class="text-center">
                  <!-- Desktop Action Buttons -->
                  <div class="action-buttons">
                    <template v-if="row.status === 'Posting' || row.status === 'Finalisasi'">
                      <v-btn 
                        size="x-small" 
                        color="primary" 
                        variant="text" 
                        prepend-icon="mdi-printer"
                        @click="onPrint(row)"
                        class="action-btn"
                      >
                        Cetak
                      </v-btn>
                      <v-btn 
                        size="x-small" 
                        color="primary" 
                        variant="text" 
                        prepend-icon="mdi-download"
                        @click="onDownload(row)"
                        class="action-btn"
                      >
                        Download Excel
                      </v-btn>
                    </template>
                    <template v-else>
                      <v-btn 
                        size="x-small" 
                        color="error" 
                        variant="text" 
                        prepend-icon="mdi-pencil"
                        @click="navigateToEdit(row)"
                        class="action-btn"
                      >
                        EDIT
                      </v-btn>
                      <v-btn 
                        size="x-small" 
                        color="error" 
                        variant="text" 
                        prepend-icon="mdi-delete"
                        @click="onDeletePeriod(row)"
                        class="action-btn"
                      >
                        Hapus
                      </v-btn>
                    </template>
                  </div>

                  <!-- Mobile/Tablet Three Dots Menu -->
                  <div class="three-dots-menu">
                    <v-menu>
                      <template v-slot:activator="{ props }">
                        <v-btn 
                          v-bind="props"
                          icon="mdi-dots-vertical"
                          size="small"
                          variant="text"
                          class="three-dots-btn"
                        ></v-btn>
                      </template>
                      <v-list>
                        <template v-if="row.status === 'Posting' || row.status === 'Finalisasi'">
                          <v-list-item 
                            @click="onPrint(row)"
                            class="action-menu-item"
                          >
                            <template v-slot:prepend>
                              <v-icon>mdi-printer</v-icon>
                            </template>
                            <v-list-item-title>Cetak</v-list-item-title>
                          </v-list-item>
                          <v-list-item 
                            @click="onDownload(row)"
                            class="action-menu-item"
                          >
                            <template v-slot:prepend>
                              <v-icon>mdi-download</v-icon>
                            </template>
                            <v-list-item-title>Download Excel</v-list-item-title>
                          </v-list-item>
                        </template>
                        <template v-else>
                          <v-list-item 
                            @click="navigateToEdit(row)"
                            class="action-menu-item"
                          >
                            <template v-slot:prepend>
                              <v-icon>mdi-pencil</v-icon>
                            </template>
                            <v-list-item-title>Lanjutkan</v-list-item-title>
                          </v-list-item>
                          <v-list-item 
                            @click="onDeletePeriod(row)"
                            class="action-menu-item"
                          >
                            <template v-slot:prepend>
                              <v-icon>mdi-delete</v-icon>
                            </template>
                            <v-list-item-title>Hapus</v-list-item-title>
                          </v-list-item>
                        </template>
                      </v-list>
                    </v-menu>
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>
          
          <!-- Pagination Info -->
          <div class="pagination-info">
            Menampilkan 1-{{ reportRows.length }} dari {{ totalRows }} data
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import apiService from '../services/api.js'

const router = useRouter()
const userEmail = ref('')
const loginTime = ref('')
const summary = ref({ kodeTagihan: '-', totalIuranDanDenda: 0, sisaPembayaranSebelumnya: 0, totalTagihan: 0 })

// Data periode pelaporan dari API
const reportRows = ref([])
const totalRows = ref(0)
let page = 1
const pageSize = ref(10)
const statusFilter = ref('all')
// Removed unused computed property

// Responsive button text based on screen size
const buttonText = computed(() => {
  if (typeof window !== 'undefined') {
    const width = window.innerWidth
    if (width <= 360) {
      return 'BUAT LAPORAN BARU'
    } else if (width <= 480) {
      return 'BUAT LAPORAN PERIODE'
    } else {
      return 'BUAT LAPORAN PERIODE BARU'
    }
  }
  return 'BUAT LAPORAN PERIODE BARU'
})

onMounted(async () => {
  // Get user data from localStorage
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      const user = JSON.parse(userData)
      userEmail.value = user.email || user.fullName || 'user@example.com'
    } catch (error) {
      console.error('Error parsing user data:', error)
      userEmail.value = 'user@example.com'
    }
  } else {
    userEmail.value = 'user@example.com'
  }

  // Get login time
  const loginTimestamp = localStorage.getItem('loginTime')
  if (loginTimestamp) {
    loginTime.value = new Date(parseInt(loginTimestamp)).toLocaleString('id-ID')
  } else {
    loginTime.value = new Date().toLocaleString('id-ID')
  }
  
  // Load data or use dummy data for testing
  try {
    await Promise.all([
      loadReportPeriods(),
      loadSummary(),
    ])
  } catch (error) {
    console.error('Error loading data:', error)
    // Use dummy data if API fails
    loadDummyData()
  }
})

// Dummy data for testing
const loadDummyData = () => {
  reportRows.value = [
    { id: 1, year: 2025, month: 9, status: 'Posting', totalTk: 150, totalIuran: 15000000, totalDenda: 0 },
    { id: 2, year: 2025, month: 8, status: 'Draft', totalTk: 145, totalIuran: 14500000, totalDenda: 500000 },
    { id: 3, year: 2025, month: 7, status: 'Posting', totalTk: 140, totalIuran: 14000000, totalDenda: 0 }
  ]
  totalRows.value = 3
}

const loadReportPeriods = async () => {
  try {
    const res = await apiService.getReportPeriods({ page, pageSize: pageSize.value, status: statusFilter.value })
    if (res && Array.isArray(res.items)) {
      reportRows.value = res.items
      totalRows.value = res.total || res.items.length
    } else if (Array.isArray(res)) {
      reportRows.value = res
      totalRows.value = res.length
    }
  } catch (e) {
    console.error('Gagal memuat periode pelaporan', e)
  }
}

const loadSummary = async () => {
  try {
    const data = await apiService.getReportSummary()
    if (data) summary.value = data
  } catch (e) {
    console.error('Gagal memuat ringkasan', e)
  }
}

const handleLogout = async () => {
  try {
    // Call logout API
    await apiService.logout()
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    // Redirect to login page
    router.push('/login')
  }
}

// Navigate to edit page
const navigateToEdit = (row) => {
  // Direct navigation to edit page without confirmation
  const dataParam = encodeURIComponent(JSON.stringify(row))
  router.push(`/edit/${dataParam}`)
}

// Tambah periode pelaporan (default: bulan berjalan), cegah duplikat per bulan
const addPeriod = async () => {
  try {
    await apiService.createReportPeriod({})
    await loadReportPeriods()
    alert('Periode pelaporan berhasil ditambahkan')
  } catch (e) {
    alert(e?.message || 'Gagal menambah periode pelaporan')
  }
}

// Removed unused filter functions

const onDeletePeriod = async (row) => {
  if (!confirm('Hapus periode ini? Hanya status Draft bisa dihapus.')) return
  try {
    await apiService.deleteReportPeriod(row.id)
    await loadReportPeriods()
  } catch (e) {
    alert(e?.message || 'Gagal menghapus periode')
  }
}

// Removed unused calculation and finalization functions

const onPrint = async (row) => {
  try {
    const res = await apiService.printReportPeriod(row.id)
    alert('Print-ready: ' + (res?.message || 'OK'))
  } catch (e) {
    alert(e?.message || 'Gagal cetak')
  }
}

// Util functions
const getMonthName = (month) => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  return months[month - 1] || 'Bulan'
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Posting':
    case 'Finalisasi':
      return 'success'
    case 'Draft':
      return 'warning'
    case 'Approval':
      return 'info'
    default:
      return 'grey'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'Posting':
    case 'Finalisasi':
      return 'FINAL'
    case 'Draft':
      return 'DRAFT'
    case 'Approval':
      return 'APPROVAL'
    default:
      return 'DRAFT'
  }
}

const onDownload = async (row) => {
  try {
    // Implement download functionality
    alert('Download Excel untuk periode ' + getMonthName(row.month) + ' ' + row.year)
  } catch (e) {
    alert(e?.message || 'Gagal download')
  }
}

// Removed unused utility functions
</script>

<!-- CSS sudah dipindahkan ke e-bpjstk/src/assets/css/dashboard.css -->
