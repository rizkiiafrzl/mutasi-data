<script setup>
/**
 * Component untuk dropdown upload massal
 * Ekstrak dari Report.vue lines 895-913
 */
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  options: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['select', 'update:show']);
</script>

<template>
  <!-- Dropdown Menu -->
  <div
    v-if="show"
    class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-lg z-50 overflow-hidden"
  >
    <button
      v-for="option in options"
      :key="option.id"
      @click="emit('select', option.id)"
      class="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
    >
      <div class="flex items-start gap-3">
        <i :class="['mdi', option.icon, 'text-lg', 'flex-shrink-0', 'mt-0.5']"></i>
        <div class="flex-1">
          <div class="text-sm font-semibold text-gray-700">{{ option.title }}</div>
          <div class="text-xs text-gray-400 mt-0.5">{{ option.description }}</div>
        </div>
      </div>
    </button>
  </div>
</template>
