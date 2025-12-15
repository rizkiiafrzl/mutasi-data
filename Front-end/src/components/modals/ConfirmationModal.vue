<script setup>
import { computed } from 'vue';
import Dialog from '../Dialog.vue';
import Button from '../Button.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'warning', 'danger', 'print', 'download'].includes(value)
  },
  confirmText: {
    type: String,
    default: 'Ya'
  },
  cancelText: {
    type: String,
    default: 'Batal'
  },
  variant: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'red', 'green'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: 'Memproses...'
  }
});

const emit = defineEmits(['confirm', 'cancel', 'close']);

const iconConfig = {
  info: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    svg: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  warning: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
    svg: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
  },
  danger: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    svg: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
  },
  print: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    svg: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z'
  },
  download: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    svg: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
  }
};

const variantConfig = {
  blue: {
    button: 'bg-blue-500 hover:bg-blue-600',
  },
  red: {
    button: 'bg-red-600 hover:bg-red-700',
  },
  green: {
    button: 'bg-green-600 hover:bg-green-700',
  }
};

const currentIcon = computed(() => iconConfig[props.icon]);

function handleConfirm() {
  emit('confirm');
}

function handleCancel() {
  emit('cancel');
  emit('close');
}
</script>

<template>
  <Dialog
    :isDialogOpen="isOpen"
    @close="handleCancel"
    dialogClass="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden flex flex-col"
    bodyClass="px-6 py-6 text-center"
    :showCloseButton="false"
    :closeOnOverlay="true"
  >
    <template #header></template>
    <template #body>
      <!-- Icon -->
      <div class="flex justify-center mb-4">
        <div :class="['w-16 h-16', currentIcon.bg, 'rounded-full flex items-center justify-center']">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            :class="['w-10 h-10', currentIcon.text]" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" :d="currentIcon.svg" />
          </svg>
        </div>
      </div>
      
      <!-- Title -->
      <h2 class="text-xl font-semibold text-gray-800 mb-4">{{ title }}</h2>
      
      <!-- Message -->
      <p class="text-sm text-gray-700 leading-relaxed mb-6" v-html="message"></p>
      
      <!-- Buttons -->
      <div class="flex gap-3">
        <Button
          v-if="cancelText"
          @click="handleCancel"
          use-custom-class
          custom-class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 px-6 rounded-md transition-colors duration-200"
        >
          {{ cancelText }}
        </Button>
        <Button
          @click="handleConfirm"
          :disabled="loading"
          use-custom-class
          :custom-class="`${cancelText ? 'flex-1' : 'w-full'} ${variantConfig[variant].button} text-white font-semibold py-2.5 px-6 rounded-md transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed`"
        >
          {{ loading ? loadingText : confirmText }}
        </Button>
      </div>
    </template>
  </Dialog>
</template>
