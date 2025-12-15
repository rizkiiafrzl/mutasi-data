<script setup>
import Button from '../base/Button.vue';
import { formatCurrency } from '../../utils/formatters.js';

/**
 * Component untuk menampilkan kartu ringkasan laporan
 * Ekstrak dari Report.vue lines 792-865
 */
defineProps({
  summaryData: {
    type: Object,
    required: true,
    default: () => ({
      totalTenagaKerja: 0,
      totalUpahRapel: 0,
      totalIuran: 0,
      totalDenda: 0
    })
  },
  rincianIuran: {
    type: Array,
    default: () => []
  }
});
</script>

<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-all">
        <div class="text-3xl font-bold text-gray-700 mb-2">
          {{ summaryData.totalTenagaKerja }}
        </div>
        <div class="text-xs font-medium text-gray-600">TOTAL TENAGA KERJA</div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-all">
        <div class="text-lg font-bold text-gray-800 mb-2">
          {{ formatCurrency(summaryData.totalUpahRapel) }}
        </div>
        <div class="text-xs font-medium text-gray-600">TOTAL UPAH + RAPEL</div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-all">
        <div class="text-lg font-bold text-orange-600 mb-2">
          {{ formatCurrency(summaryData.totalIuran) }}
        </div>
        <div class="text-xs font-medium text-gray-600">TOTAL IURAN</div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-all">
        <div class="text-lg font-bold text-rose-600 mb-2">
          {{ formatCurrency(summaryData.totalDenda) }}
        </div>
        <div class="text-xs font-medium text-gray-600 mb-3">TOTAL DENDA</div>
        <Button 
          use-custom-class 
          custom-class="w-full bg-rose-600 text-white py-2 px-4 rounded-md text-sm font-semibold hover:bg-rose-800 transition-colors"
        >
          DETAIL
        </Button>
      </div>
    </div>

    <!-- Rincian Iuran per Program -->
    <div>
      <h2 class="text-lg font-semibold text-gray-800 mb-4">
        Rincian Iuran per Program
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="(item, index) in rincianIuran"
          :key="index"
          class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-all"
        >
          <div class="flex items-center gap-2 mb-3">
            <span
              :class="[
                'px-2 py-1 rounded text-xs font-medium text-white',
                item.color === 'blue' ? 'bg-blue-500' : '',
                item.color === 'pink' ? 'bg-pink-500' : '',
                item.color === 'orange' ? 'bg-orange-500' : '',
                item.color === 'purple' ? 'bg-purple-500' : '',
                item.color === 'rose' ? 'bg-rose-500' : '',
              ]"
            >
              {{ item.program }}
            </span>
          </div>
          <div class="text-xs font-medium text-gray-600 mb-2">{{ item.label }}</div>
          <div class="text-lg font-bold text-gray-800 mb-3">
            {{ formatCurrency(item.amount) }}
          </div>
          <button
            v-if="item.program === 'JP'"
            class="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm font-semibold hover:bg-purple-800 transition-colors"
          >
            KARTU ANGSURAN
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
