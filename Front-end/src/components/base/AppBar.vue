<script>
export default {
  name: "AppBar",
  props: {
    bar: String,
    variantClass: {
      type: String,
      default: "blue",
      validator: (value) => ["blue"].includes(value),
    },
  },
  computed: {
    computedVariantClass() {
      const variantClass = {
        blue: "text-black bg-[#EBF3F9] text-xl font-medium uppercase",
      };
      return variantClass[this.variantClass];
    },
  },
};
</script>
<template>
  <div :class="['px-4', 'py-2', computedVariantClass]">
    {{ bar }}
  </div>
</template>
