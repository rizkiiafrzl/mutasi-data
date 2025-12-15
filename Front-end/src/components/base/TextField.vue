<script>
export default {
  name: "TextField",
  props: { 
    labels: Array,
    modelValue: {
      type: String,
      default: "",
    },
    customClass: {
      type: String,
      default: "",
    },
    useCustomClass: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "text",
    },
  },
  emits: ['update:modelValue'],
};
</script>
<template>
  <!-- Multiple fields (original behavior) -->
  <div v-if="labels && labels.length > 0" v-for="label in labels" :key="label" class="flex flex-col gap-2 text-sm">
    <form class="flex flex-col md:flex-row justify-between items-center gap-1">
      <label class="w-full lg:w-1/2">{{ label }}</label>
      <input
        type="text"
        class="w-full lg:w-1/2  bg-[#FFF9DC] py-1.5 px-3 rounded-xs border border-[#DADADA]"
      />
    </form>
  </div>
  
  <!-- Single field (new flexible behavior) -->
  <input
    v-else
    :type="type"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    :placeholder="placeholder"
    :class="useCustomClass ? customClass : 'w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150'"
  />
</template>
