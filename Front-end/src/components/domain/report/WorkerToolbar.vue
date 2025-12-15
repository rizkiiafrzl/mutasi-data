<script setup>
import Button from '../base/Button.vue';
import SearchBar from '../base/SearchBar.vue';
import UploadMassalDropdown from './UploadMassalDropdown.vue';

/**
 * Component untuk toolbar aksi dan filter di halaman Report
 * Ekstrak dari Report.vue lines 867-994
 */
const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  statusFilter: {
    type: String,
    default: 'all'
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },
  itemsPerPageOptions: {
    type: Array,
    default: () => [5, 10, 25, 50, 100]
  },
  isRecalculating: {
    type: Boolean,
    default: false
  },
  showUploadDropdown: {
    type: Boolean,
    default: false
  },
  uploadOptions: {
    type: Array,
    default: () => []
  },
  showCountdown: {
    type: Boolean,
    default: false
  },
  countdownValue: {
    type: Number,
    default: 3
  }
});

const emit = defineEmits([
  'update:searchQuery',
  'update:statusFilter',
  'update:itemsPerPage',
  'update:showUploadDropdown',
  'add-worker',
  'upload-select',
  'recalculate',
  'finalize',
  'refresh'
]);
</script>

<template>
  <div class="space-y-4">
    <!-- Action Buttons -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <Button 
        use-custom-class 
        custom-class="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-md shadow-md hover:shadow-lg transition-all duration-200 text-sm uppercase"
        @click="emit('add-worker')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span>TAMBAH TK</span>
      </Button>

      <div class="relative">
        <button
          @click="emit('update:showUploadDropdown', !showUploadDropdown)"
          class="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-md shadow-md hover:shadow-lg transition-all duration-200 text-sm uppercase"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span>UPLOAD MASSAL</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <UploadMassalDropdown
          :show="showUploadDropdown"
          :options="uploadOptions"
          @select="(type) => emit('upload-select', type)"
          @update:show="(val) => emit('update:showUploadDropdown', val)"
        />
      </div>

      <button
        @click="emit('recalculate')"
        :disabled="isRecalculating"
        class="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-md shadow-md hover:shadow-lg transition-all duration-200 text-sm uppercase disabled:opacity-60 disabled:cursor-not-allowed">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span>{{ isRecalculating ? 'MENGHITUNG…' : 'HITUNG IURAN' }}</span>
      </button>

      <Button
        @click="emit('finalize')"
        use-custom-class
        custom-class="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-md shadow-md hover:shadow-lg transition-all duration-200 text-sm uppercase"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span>FINALISASI</span>
      </Button>
    </div>

    <div
      v-if="showCountdown"
      class="text-center text-xs font-semibold text-green-700">
      Menghitung dalam {{ countdownValue }} detik...
    </div>

    <!-- Toolbar & Filters -->
    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3 w-full">
      <!-- Bagian kiri (dropdowns) -->
      <div class="flex flex-col sm:flex-row sm:items-end gap-3 w-full md:w-auto">
        <div class="w-full sm:w-48">
          <label class="block text-xs text-gray-500 mb-1.5 font-medium">Status</label>
          <div class="relative">
            <select 
              :value="statusFilter"
              @change="emit('update:statusFilter', $event.target.value)"
              class="w-full h-[42px] px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none pr-10"
            >
              <option value="all">Semua status</option>
              <option value="Aktif">Aktif</option>
              <option value="Baru">Baru</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div class="w-full sm:w-36">
          <label class="block text-xs text-gray-500 mb-1.5 font-medium">Tampilkan</label>
          <div class="relative">
            <select 
              :value="itemsPerPage"
              @change="emit('update:itemsPerPage', Number($event.target.value))"
              class="w-full h-[42px] px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none pr-10"
            >
              <option v-for="opt in itemsPerPageOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      <!-- Bagian kanan (search + refresh) -->
      <div class="flex items-end gap-3 w-full sm:w-auto">
        <div class="flex-1 md:w-80">
          <label class="block text-xs text-gray-500 mb-1.5 font-medium">Cari</label>
          <SearchBar 
            :model-value="searchQuery"
            @update:model-value="emit('update:searchQuery', $event)"
            use-custom-class 
            custom-class="w-full h-[42px] px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150"
            placeholder="Cari Nama / NIK / KPJ"
          />
        </div>
        <button
          @click="emit('refresh')"
          class="h-[42px] px-4 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors duration-200">
          REFRESH
        </button>
      </div>
    </div>
  </div>
</template>
