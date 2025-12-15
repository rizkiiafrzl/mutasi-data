<script>
export default {
  name: "NavBar",
  props: { tabs: Array, activeTab: String },
};
</script>
<template>
  <div class="flex cursor-pointer">
    <div
      v-for="tab in tabs"
      :key="tab.name"
      :class="[
        `w-fit px-3 py-2 text-xs sm:text-sm md:text-base  font-medium uppercase rounded-t-xs`,
        tab.name === activeTab
          ? 'bg-[#34618F] text-white'
          : 'bg-[#EBF3F9] text-black',
      ]"
      @click="$emit('update:activeTab', tab.name)"
    >
      {{ tab.label }}
    </div>
  </div>
</template>
