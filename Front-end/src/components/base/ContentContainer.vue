<script>
import { computed } from "vue";

export default {
  name: "ContentContainer",
  props: {
    header: String,
    subHeader: String,
    variantClass: {
      type: String,
      default: "gray",
      validator: (value) => ["gray", "none"].includes(value),
    },
    sizeClass: {
      type: String,
      default: "full",
      validator: (value) => ["full"].includes(value),
    },
    headerClass: {
      type: String,
      default: "black",
      validator: (value) => ["black", "blue"].includes(value),
    },
    additionalStyle: {
      type: String,
      default: "",
    },
  },
  computed: {
    computedVariantClass() {
      const variantClass = {
        gray: "border-1 border-gray-200",
        none: "",
      };
      return variantClass[this.variantClass];
    },
    computedSizeClass() {
      const sizeClass = {
        full: "w-full rounded-xs",
      };
      return sizeClass[this.sizeClass];
    },
    computedHeaderClass() {
      const headerClass = {
        black: "bg-white text-black",
        blue: "bg-[#34618F] text-white",
      };
      return headerClass[this.headerClass];
    },
    hasActionSlot() {
      return !!this.$slots.action;
    },
  },
};
</script>
<template>
  <!--Untuk keseluruhan-->
  <div :class="['bg-white', 'border', 'border-gray-200', 'rounded-lg', 'shadow-sm', computedVariantClass, computedSizeClass, additionalStyle]">
    <!--Untuk header + subheader + action-->
    <div
      :class="[
        'flex',
        'flex-col',
        'lg:flex-row',
        'justify-between',
        'gap-4',
        'w-full',
        'lg:items-center',
        'px-6',
        'py-3',
        computedHeaderClass,
        // Tambahkan border-bottom jika ada action slot
        hasActionSlot ? 'border-b border-gray-200' : '',
      ]"
    >
      <div class="flex flex-col rounded-xs">
        <h1 v-if="header" class="font-semibold text-lg uppercase">
          {{ header }}
        </h1>
        <p v-if="subHeader" class="text-sm text-justify">{{ subHeader }}</p>
      </div>
      <slot name="action" />
    </div>
    <div class="px-6 pb-6 bg-white">
      <slot name="body" />
    </div>
  </div>
</template>
