<script>
export default {
  name: "SearchBar",
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "Search",
    },
    customClass: {
      type: String,
      default: "",
    },
    useCustomClass: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
<template>
  <div v-if="!useCustomClass" class="border border-[#DADADA] px-3 py-2.5 w-full rounded-xs">
    <input
      type="text"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      class="outline-none placeholder:text-[#DADADA] w-full"
    />
  </div>
  <input
    v-else
    type="text"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    :placeholder="placeholder"
    :class="customClass"
  />
</template>
