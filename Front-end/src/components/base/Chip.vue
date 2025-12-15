<script>
export default {
  name: "Chip",
  props: {
    label: String,
    variant: {
      type: String,
      default: "default",
    },
  },
  computed: {
    chipClasses() {
      const variants = {
        default: "bg-gray-200 text-gray-800 border border-gray-400",
        draft: "bg-orange-200 text-orange-800 border border-orange-400",
        final: "bg-green-200 text-green-800 border border-green-400",
        approval: "bg-blue-200 text-blue-800 border border-blue-400",
        posting: "bg-purple-200 text-purple-800 border border-purple-400",
        // Support untuk variant lama (backward compatibility)
        orange: "bg-orange-200 text-orange-800 border border-orange-400",
        green: "bg-green-200 text-green-800 border border-green-400",
        blue: "bg-blue-200 text-blue-800 border border-blue-400",
        purple: "bg-purple-200 text-purple-800 border border-purple-400",
      };
      // Normalize variant ke lowercase untuk case-insensitive matching
      const variantKey = (this.variant || '').toLowerCase();
      return variants[variantKey] || variants.default;
    },
  },
};
</script>

<template>
  <div
    :class="[
      'inline-flex',
      'items-center',
      'justify-center',
      'px-3',
      'py-[3px]',
      'rounded-md',
      'text-xs',
      'font-semibold',
      chipClasses,
    ]"
  >
    {{ label }}
  </div>
</template>
