<script setup>
import Dialog from '../base/Dialog.vue';
import Button from '../base/Button.vue';
import Chip from '../base/Chip.vue';
import { formatCurrency } from '../../utils/formatters.js';

/**
 * Component untuk modal detail pekerja
 * Ekstrak dari Report.vue lines 1111-1332
 */
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  worker: {
    type: Object,
    default: null
  },
  contribution: {
    type: Object,
    default: null
  },
  activeTab: {
    type: String,
    default: 'data'
  }
});

const emit = defineEmits(['close', 'update:activeTab', 'nonaktifkan']);
</script>

<template>
  <Dialog
    header="Detail Peserta"
    :isDialogOpen="show"
    @close="emit('close')"
    :dialogClass="'bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden'"
    :bodyClass="'px-6 py-6 flex-1 overflow-y-auto'"
    :showCloseButton="false"
    :closeOnOverlay="true"
  >
    <template #header>
      <div class="px-6 py-5 border-b border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-800">Detail Peserta</h2>
          </div>
          <Chip
            v-if="worker && worker.status"
            :label="worker.status"
            :variant="worker.status === 'Aktif' ? 'final' : worker.status === 'Nonaktif' ? 'draft' : 'default'"
          />
        </div>

        <!-- Tab Navigation -->
        <div class="flex gap-2 border-b border-gray-200">
          <button
            @click="emit('update:activeTab', 'data')"
            :class="[
              'px-4 py-2 text-sm font-medium transition-colors border-b-2',
              activeTab === 'data'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Data
          </button>
          <button
            @click="emit('update:activeTab', 'rincian')"
            :class="[
              'px-4 py-2 text-sm font-medium transition-colors border-b-2',
              activeTab === 'rincian'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Rincian
          </button>
        </div>
      </div>
    </template>

    <template #body>
      <div v-if="worker">
        <!-- Tab: Data -->
        <div v-if="activeTab === 'data'" class="space-y-4">
          <div class="bg-white border border-gray-200 rounded-lg p-5">
            <h3 class="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Data Lengkap Karyawan
            </h3>

            <div class="mb-4">
              <div class="text-lg font-semibold text-gray-800 mb-1">{{ worker.nama }}</div>
              <div class="text-sm text-gray-500">NIK: {{ worker.nik }}</div>
            </div>

            <div class="space-y-3 text-sm">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <div class="text-xs font-medium text-gray-500 uppercase">Jenis Kelamin</div>
                  <div class="text-gray-700 font-medium">{{ worker.jk || '-' }}</div>
                </div>
                <div class="space-y-1">
                  <div class="text-xs font-medium text-gray-500 uppercase">KPJ</div>
                  <div class="text-gray-700 font-medium">{{ worker.kpj || '-' }}</div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <div class="text-xs font-medium text-gray-500 uppercase">Upah Pokok</div>
                  <div class="text-gray-700 font-medium">{{ worker.upahPokokDisplay }}</div>
                </div>
                <div class="space-y-1">
                  <div class="text-xs font-medium text-gray-500 uppercase">Rapel</div>
                  <div class="text-gray-700 font-medium">{{ worker.rapelDisplay }}</div>
                </div>
              </div>

              <div class="space-y-1">
                <div class="text-xs font-medium text-gray-500 uppercase">Total Upah</div>
                <div class="text-lg font-bold text-gray-800">{{ worker.totalUpahDisplay }}</div>
              </div>

              <div v-if="worker.kategori" class="space-y-1">
                <div class="text-xs font-medium text-gray-500 uppercase">Kategori</div>
                <div class="text-gray-700 font-medium">{{ worker.kategori }}</div>
              </div>

              <div v-if="worker.tanggalMasuk || worker.tanggalKeluar" class="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                <div class="space-y-1">
                  <div class="text-xs font-medium text-gray-500 uppercase">Tanggal Masuk</div>
                  <div class="text-gray-700 font-medium">{{ worker.tanggalMasuk || '-' }}</div>
                </div>
                <div class="space-y-1">
                  <div class="text-xs font-medium text-gray-500 uppercase">Tanggal Keluar</div>
                  <div class="text-gray-700 font-medium">{{ worker.tanggalKeluar || '-' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Rincian -->
        <div v-if="activeTab === 'rincian'" class="space-y-4">
          <div
            v-if="contribution"
            class="bg-white border border-gray-200 rounded-lg p-5"
          >
            <h3 class="text-base font-semibold text-gray-800 mb-2 pb-2 border-b border-gray-200">
              Kontribusi Iuran
            </h3>
            <p class="text-xs text-gray-500 mb-4">
              Perhitungan menggunakan gaji pokok ({{ formatCurrency(contribution.salaryBase) }}) dan tarif risiko
              <span class="font-semibold text-gray-700">{{ contribution.riskLevel }}</span>.
            </p>

            <div class="space-y-4">
              <!-- Beban Perusahaan -->
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 class="text-sm font-semibold text-green-800 mb-3">Beban Perusahaan</h4>
                <ul class="space-y-2 text-sm text-green-900">
                  <li class="flex justify-between">
                    <span>JKK</span>
                    <span class="font-medium">{{ formatCurrency(contribution.breakdown.company.jkk) }}</span>
                  </li>
                  <li class="flex justify-between">
                    <span>JKM</span>
                    <span class="font-medium">{{ formatCurrency(contribution.breakdown.company.jkm) }}</span>
                  </li>
                  <li class="flex justify-between">
                    <span>JHT (3,7%)</span>
                    <span class="font-medium">{{ formatCurrency(contribution.breakdown.company.jht) }}</span>
                  </li>
                  <li class="flex justify-between">
                    <span>JP (2%)</span>
                    <span class="font-medium">{{ formatCurrency(contribution.breakdown.company.jp) }}</span>
                  </li>
                </ul>
                <div class="mt-4 pt-3 border-t border-green-200 flex justify-between text-sm font-semibold text-green-900">
                  <span>Total</span>
                  <span>{{ formatCurrency(contribution.breakdown.company.total) }}</span>
                </div>
              </div>

              <!-- Potongan Karyawan -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 class="text-sm font-semibold text-blue-800 mb-3">Potongan Karyawan</h4>
                <ul class="space-y-2 text-sm text-blue-900">
                  <li class="flex justify-between">
                    <span>JHT (2%)</span>
                    <span class="font-medium">{{ formatCurrency(contribution.breakdown.employee.jht) }}</span>
                  </li>
                  <li class="flex justify-between">
                    <span>JP (1%)</span>
                    <span class="font-medium">{{ formatCurrency(contribution.breakdown.employee.jp) }}</span>
                  </li>
                </ul>
                <div class="mt-4 pt-3 border-t border-blue-200 flex justify-between text-sm font-semibold text-blue-900">
                  <span>Total</span>
                  <span>{{ formatCurrency(contribution.breakdown.employee.total) }}</span>
                </div>
              </div>

              <!-- Total Keseluruhan -->
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm flex justify-between items-center text-gray-700">
                <span class="font-semibold">Total keseluruhan iuran</span>
                <span class="text-lg font-bold text-gray-900">
                  {{ formatCurrency(contribution.totals.overall) }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="bg-white border border-gray-200 rounded-lg p-5 text-center text-gray-500">
            <p class="text-sm">Data kontribusi tidak tersedia</p>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <Button
          v-if="worker && worker.status === 'Aktif'"
          @click="emit('nonaktifkan')"
          use-custom-class
          custom-class="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728" />
          </svg>
          Nonaktifkan Peserta
        </Button>
        <Button
          @click="emit('close')"
          use-custom-class
          custom-class="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Tutup
        </Button>
      </div>
    </template>
  </Dialog>
</template>
