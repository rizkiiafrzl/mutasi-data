<script setup>
import Dialog from '../base/Dialog.vue';
import Button from '../base/Button.vue';
import CheckBox from '../base/CheckBox.vue';

/**
 * Component untuk modal finalisasi laporan
 * Ekstrak dari Report.vue lines 1430-1498
 */
const props

 = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  checklist: {
    type: Object,
    required: true
  },
  error: {
    type: String,
    default: ''
  },
  periode: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'confirm', 'update:checklist', 'checklist-change']);

function handleChecklistChange() {
  emit('checklist-change');
}

function updateChecklist(key, value) {
  emit('update:checklist', { ...props.checklist, [key]: value });
}
</script>

<template>
  <Dialog
    header="Finalisasi Periode Pelaporan"
    :isDialogOpen="show"
    @close="emit('close')"
    :dialogClass="'bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden flex flex-col'"
    :bodyClass="'px-6 py-6'"
    :showCloseButton="false"
    :closeOnOverlay="true"
  >
    <template #header>
      <div class="px-6 py-5 border-b border-gray-200 flex items-center gap-3">
        <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-800">Finalisasi Periode Pelaporan</h2>
      </div>
    </template>

    <template #body>
      <p class="text-sm text-gray-700 mb-4">
        Sebelum melakukan finalisasi, pastikan semua checklist berikut sudah terpenuhi:
      </p>
      <div class="space-y-3">
        <CheckBox 
          id="check-tk-lengkap" 
          :modelValue="checklist.dataTkLengkap" 
          @update:modelValue="(val) => { updateChecklist('dataTkLengkap', val); handleChecklistChange(); }"
        >
          Data Tenaga Kerja sudah lengkap dan valid
        </CheckBox>
        <CheckBox 
          id="check-upah-benar" 
          :modelValue="checklist.dataUpahBenar" 
          @update:modelValue="(val) => { updateChecklist('dataUpahBenar', val); handleChecklistChange(); }"
        >
          Data Upah dan Rapel sudah diinput dengan benar
        </CheckBox>
        <CheckBox 
          id="check-perhitungan-iuran" 
          :modelValue="checklist.perhitunganIuran" 
          @update:modelValue="(val) => { updateChecklist('perhitunganIuran', val); handleChecklistChange(); }"
        >
          Perhitungan Iuran sudah dilakukan
        </CheckBox>
        <CheckBox 
          id="check-total-verifikasi" 
          :modelValue="checklist.totalIuranDiverifikasi" 
          @update:modelValue="(val) => { updateChecklist('totalIuranDiverifikasi', val); handleChecklistChange(); }"
        >
          Total Iuran dan Denda sudah diverifikasi
        </CheckBox>
        <CheckBox 
          id="check-tidak-ada-perubahan" 
          :modelValue="checklist.tidakAdaPerubahan" 
          @update:modelValue="(val) => { updateChecklist('tidakAdaPerubahan', val); handleChecklistChange(); }"
        >
          Tidak ada perubahan data setelah finalisasi
        </CheckBox>
      </div>
      <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
        <div class="flex items-start gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <Button
          @click="emit('close')"
          use-custom-class
          custom-class="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          BATAL
        </Button>
        <Button
          @click="emit('confirm')"
          use-custom-class
          custom-class="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
        >
          FINALISASI
        </Button>
      </div>
    </template>
  </Dialog>
</template>
