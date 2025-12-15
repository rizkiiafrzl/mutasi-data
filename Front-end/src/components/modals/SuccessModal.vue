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
    default: 'Berhasil'
  },
  message: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'green',
    validator: (value) => ['green', 'blue'].includes(value)
  },
  buttonText: {
    type: String,
    default: 'OK'
  }
});

const emit = defineEmits(['close']);

const variantConfig = {
  green: {
    iconBg: 'bg-green-100',
    iconText: 'text-green-600',
    button: 'bg-green-600 hover:bg-green-700'
  },
  blue: {
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    button: 'bg-blue-500 hover:bg-blue-600'
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
    dialogClass="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden flex flex-col"
    bodyClass="px-6 py-6 text-center"
    :showCloseButton="false"
    :closeOnOverlay="true"
  >
    <template #header>
      <div class="px-6 py-5 border-b border-gray-200 flex items-center gap-3">
        <div :class="['w-10 h-10', variantConfig[variant].iconBg, 'rounded-full flex items-center justify-center']">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            :class="['w-6 h-6', variantConfig[variant].iconText]" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-800">{{ title }}</h2>
      </div>
    </template>
    
    <template #body>
      <p class="text-sm leading-relaxed text-gray-700">{{ message }}</p>
    </template>
    
    <template #footer>
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
        <Button
          @click="handleClose"
          use-custom-class
          :custom-class="`px-5 py-2.5 text-sm font-semibold text-white ${variantConfig[variant].button} rounded-md transition-colors`"
        >
          {{ buttonText }}
        </Button>
      </div>
    </template>
  </Dialog>
</template>
