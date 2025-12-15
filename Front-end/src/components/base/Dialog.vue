<script>
import Button from "./Button.vue";

export default {
  name: "Dialog",
  components: {
    Button,
  },
  props: {
    header: {
      type: String,
      default: "",
    },
    isDialogOpen: {
      type: Boolean,
      required: true,
    },
    dialogClass: {
      type: String,
      default:
        "bg-white flex flex-col gap-4 max-h-[80vh] overflow-y-auto w-11/12 sm:w-5/6 md:mx-0 md:w-5/6 lg:w-[845px] mx-auto rounded-xs p-5 overflow-auto shadow-md",
    },
    bodyClass: {
      type: String,
      default: "",
    },
    showCloseButton: {
      type: Boolean,
      default: true,
    },
    closeOnOverlay: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close"],
  methods: {
    handleClose() {
      this.$emit("close", false);
    },
    handleOverlayClick() {
      if (this.closeOnOverlay) {
        this.handleClose();
      }
    },
  },
};
</script>
<template>
  <Teleport to="body">
    <div
      v-if="isDialogOpen"
      class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
      @click.self="handleOverlayClick"
    >
      <div
        :class="dialogClass"
      >
        <!--HEADER & ACTION-->
        <template v-if="$slots.header">
          <slot name="header" />
        </template>
        <template v-else>
          <div
            class="flex gap-2 flex-col md:flex-row md:justify-between md:items-center"
          >
            <h1 class="text-xl font-semibold uppercase">
              {{ header }}
            </h1>

            <div class="flex" v-if="showCloseButton">
              <Button button="Tutup" variantClass="red" @click="handleClose" />
            </div>
          </div>
        </template>
        <div :class="bodyClass">
          <slot name="body" />
        </div>
        <template v-if="$slots.footer">
          <slot name="footer" />
        </template>
      </div>
    </div>
  </Teleport>
</template>
