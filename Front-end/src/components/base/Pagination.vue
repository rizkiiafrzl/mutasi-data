<script setup>
const props = defineProps({
  currentPage: {
    type: Number,
    default: 1,
  },
  totalPages: {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits(["prev", "next"]);

function handlePrev() {
  if (props.currentPage > 1) {
    emit("prev");
  }
}

function handleNext() {
  if (props.currentPage < props.totalPages) {
    emit("next");
  }
}
</script>

<template>
  <div class="flex justify-center items-center gap-4 mt-4">
    <button
      @click="handlePrev"
      :disabled="currentPage === 1"
      :class="[
        'px-3 py-1 rounded border',
        currentPage === 1
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300',
      ]"
    >
      &lt;&lt;
    </button>
    <span class="text-sm text-gray-700">
      Halaman {{ currentPage }} / {{ totalPages }}
    </span>
    <button
      @click="handleNext"
      :disabled="currentPage === totalPages"
      :class="[
        'px-3 py-1 rounded border',
        currentPage === totalPages
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300',
      ]"
    >
      &gt;&gt;
    </button>
  </div>
</template>







