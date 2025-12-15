<script>
export default {
  name: "Button",
  props: {
    button: String,
    variantClass: {
      type: String,
      default: "blue",
      validator: (value) => ["blue", "red", "lightBlue", "green", "rose", "purple"].includes(value),
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
  computed: {
    computedVariantClass() {
      if (this.useCustomClass) {
        return "";
      }
      const variantClass = {
        blue: "bg-[#34618F] text-white hover:bg-[#EBF3F9] hover:text-black transition-colors duration-300",
        lightBlue:
          "bg-[#EBF3F9] text-black hover:bg-[#003C68] hover:text-white transition-colors duration-300",
        red: "bg-[#CC221E] text-white hover:bg-[#FFD1D0] hover:text-[#CC221E] transition-colors duration-300",
        green: "bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-md shadow-md hover:shadow-lg transition-all duration-200 text-sm uppercase",
        rose: "bg-rose-600 text-white hover:bg-rose-800 transition-colors",
        purple: "bg-purple-600 text-white hover:bg-purple-800 transition-colors",
      };
      return variantClass[this.variantClass] || "";
    },
    buttonClasses() {
      if (this.useCustomClass) {
        return this.customClass;
      }
      return [
        'flex',
        'items-center',
        'cursor-pointer',
        'text-sm',
        'font-medium',
        'text-center',
        'w-fit',
        this.computedVariantClass,
      ];
    },
  },
};
</script>
<template>
  <button :class="buttonClasses">
    <slot></slot>
    <span v-if="button && !$slots.default">{{ button }}</span>
  </button>
</template>
