<script>
import Chip from "./Chip.vue";

export default {
  name: "Card",
  props: {
    user: {
      type: Object,
      default: () => ({}),
    },
  },
  components: {
    Chip,
  },
};
</script>
<template>
  <div class="w-96 border border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-md cursor-pointer transition-shadow duration-300 bg-white">
    <div class="flex flex-col gap-2.5">
      <!--LOGO & HEADER-->
      <div class="flex flex-row justify-between gap-3">
        <img src="../assets/logoBPJS.png" class="w-32" />
        <Chip :label="user.Tipe" textClass="text-sm" />
      </div>
      <!--NAMA & LOKASI-->
      <div class="flex flex-col">
        <h1 class="font-medium text-lg">{{ user.Nama }}</h1>
        <p class="text-sm text-[#DADADA]">{{ user.Kantor }}</p>
      </div>
      <hr class="border-t border-gray-200" />
      <!--KODE PEGAWAI & JABATAN-->
      <div class="text-sm">
        <div class="flex flex-row justify-between items-center">
          <p class="text-[#DADADA]">Kode Pegawai</p>
          <p class="font-medium">{{ user.Kode }}</p>
        </div>
        <div class="flex flex-row justify-between items-center">
          <p class="text-[#DADADA]">Jabatan</p>
          <p class="font-medium">{{ user.Jabatan }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
