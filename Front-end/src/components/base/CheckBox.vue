<script>
export default {
  name: "CheckBox",
  props: { 
    labels: Array,
    modelValue: {
      type: [Boolean, Array],
      default: false,
    },
    id: {
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
  },
  emits: ['update:modelValue', 'change'],
  methods: {
    handleChange(event) {
      if (Array.isArray(this.modelValue)) {
        // For multiple checkboxes
        const newValue = [...this.modelValue];
        if (event.target.checked) {
          newValue.push(event.target.value);
        } else {
          const index = newValue.indexOf(event.target.value);
          if (index > -1) {
            newValue.splice(index, 1);
          }
        }
        this.$emit('update:modelValue', newValue);
      } else {
        // For single checkbox
        this.$emit('update:modelValue', event.target.checked);
      }
      this.$emit('change', event);
    },
  },
};
</script>
<template>
  <!-- Multiple checkboxes (original behavior) -->
  <div v-if="labels && labels.length > 0" class="flex flex-col gap-2.5">
    <label
      class="flex items-center gap-3 text-sm"
      v-for="label in labels"
      :key="label.name || label"
    >
      <input 
        type="checkbox" 
        class="w-4 h-4 accent-[#EBF3F9]"
        :value="label.value || label"
        :checked="Array.isArray(modelValue) && modelValue.includes(label.value || label)"
        @change="handleChange"
      />
      {{ label.label || label }}
    </label>
  </div>
  
  <!-- Single checkbox (new flexible behavior) -->
  <div v-else class="flex items-start gap-3">
    <input
      type="checkbox"
      :id="id"
      :checked="modelValue"
      @change="handleChange"
      :class="useCustomClass ? customClass : 'mt-0.5 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2'"
    />
    <label v-if="$slots.default" :for="id" class="text-sm text-gray-700 cursor-pointer leading-relaxed">
      <slot></slot>
    </label>
  </div>
</template>
