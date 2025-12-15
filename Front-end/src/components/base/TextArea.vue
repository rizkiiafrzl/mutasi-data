<script>
export default {
  name: "TextArea",
  props: {
    label: String,
    rows: {
      type: Number,
      default: 2,
    },
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
  },
  emits: ['update:modelValue'],
};
</script>
<template>
  <div class="flex flex-col">
    <label v-if="label" class="block text-sm font-medium text-gray-600 mb-1.5">{{ label }}</label>
    <textarea
      :rows="rows"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :class="useCustomClass ? customClass : 'w-full bg-[#FFF9DC] py-2 px-3 rounded-xs border border-[#DADADA]'"
    />
  </div>
</template>
