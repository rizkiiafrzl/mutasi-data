<script setup>
import Table from '../base/Table.vue';
import Pagination from '../base/Pagination.vue';
import Chip from '../base/Chip.vue';
import { transformWorkerStatus } from '../../utils/dataTransform.js';

/**
 * Component untuk tabel pekerja
 * Ekstrak dari Report.vue lines 996-1031
 */
defineProps({
  headers: {
    type: Array,
    required: true
  },
  workers: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  currentPage: {
    type: Number,
    default: 1
  },
  totalPages: {
    type: Number,
    default: 1
  }
});

const emit = defineEmits(['worker-action', 'prev-page', 'next-page']);
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="text-sm text-gray-500">Memuat data pekerja...</div>
    </div>

    <!-- Empty State -->
    <div v-else-if="workers.length === 0" class="flex justify-center items-center py-12">
      <div class="text-sm text-gray-500">Tidak ada data pekerja</div>
    </div>

    <!-- Table -->
    <template v-else>
      <Table :header="headers" :data="workers" :customColumns="['status', 'aksi']">
        <template #cell-status="{ row }">
          <div class="flex justify-center">
            <Chip 
              :label="transformWorkerStatus(row.status || 'AKTIF')" 
              :variant="row.status && row.status.toUpperCase() === 'AKTIF' ? 'final' : 'default'" 
            />
          </div>
        </template>
        <template #cell-aksi="{ row }">
          <div class="flex justify-center">
            <button
              type="button"
              @click="emit('worker-action', row._original)"
              class="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
            >
              ⋮
            </button>
          </div>
        </template>
      </Table>
      <Pagination 
        :currentPage="currentPage" 
        :totalPages="totalPages" 
        @prev="emit('prev-page')" 
        @next="emit('next-page')" 
      />
    </template>
  </div>
</template>
