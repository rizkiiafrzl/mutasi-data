<script setup>
import Dialog from '../Dialog.vue';
import Button from '../Button.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Peringatan'
  },
  message: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'warning',
    validator: (value) => ['warning', 'error'].includes(value)
  },
  buttonText: {
    type: String,
    default: 'OK'
  },
  showIcon: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['close']);

const variantConfig = {
  warning: {
    iconBg: 'bg-yellow-100',
    iconText: 'text-yellow-600',
    alertBg: 'bg-red-50',
    alertBorder: 'border-red-200',
    alertText: 'text-red-700',
    alertIcon: 'text-red-600'
  },
  error: {
    iconBg: 'bg-red-100',
    iconText: 'text-red-600',
    alertBg: 'bg-red-50',
    alertBorder: 'border-red-200',
    alertText: 'text-red-700',
    alertIcon: 'text-red-600'
  }
};

function handleClose() {
  emit('close');
}
</script>

<template>
  <Dialog
    :isDialogOpen="isOpen"
    @close="handleClose"
    dialogClass="bg-white rounded-lg shadow-sm max-w-md w-full overflow-hidden flex flex-col"
    bodyClass="px-6 py-6"
    :showCloseButton="false"
    :closeOnOverlay="true"
  >
    <template #header>
      <div class="px-6 py-5 border-b border-gray-200 flex items-center gap-3">
        <div v-if="showIcon" :class="['w-10 h-10', variantConfig[variant].iconBg, 'rounded-full flex items-center justify-center']">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            :class="['w-6 h-6', variantConfig[variant].iconText]" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-800">{{ title }}</h2>
      </div>
    </template>
    
    <template #body>
      <div :class="['p-3', variantConfig[variant].alertBg, 'border', variantConfig[variant].alertBorder, 'rounded-md flex items-start gap-2']">
        <div class="flex items-start gap-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            :class="['w-4 h-4', variantConfig[variant].alertIcon, 'mt-0.5']" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p :class="['text-sm', variantConfig[variant].alertText]">{{ message }}</p>
        </div>
      </div>
    </template>
    
    <template #footer>
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
        <Button
          @click="handleClose"
          use-custom-class
          custom-class="px-5 py-2.5 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
        >
          {{ buttonText }}
        </Button>
      </div>
    </template>
  </Dialog>
</template>
