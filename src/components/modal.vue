<template>
  <div class="m-1 modal-pos">
    <div class="mx-auto">
      <button
        class="btn btn-light m-3"
        onclick="document.getElementById('getFile').click();"
      >
        <font-awesome-icon icon="fa-solid fa-upload"></font-awesome-icon>
        <input
          id="getFile"
          type="file"
          ref="file"
          @click="canvasStore.imgSource = 0"
          @change="selectFile($event, this.$refs.file.files)"
          required
          multiple
          style="display: none"
        />
      </button>

      <button class="btn btn-light m-3" @click="canvasStore.imgSource = 1">
        <font-awesome-icon
          icon="fa-solid fa-magnifying-glass"
        ></font-awesome-icon>
      </button>
    </div>
  </div>
</template>

<script>
import { useCanvas } from "@/stores/canvasStore";

export default {
  name: "Modal",
  setup() {
    const canvasStore = useCanvas();
    return { canvasStore };
  },
  methods: {
    selectFile(event, file) {
      this.canvasStore.selectFile(file);
    },
  },
};
</script>

<style scoped>
.modal-pos {
  position: fixed;
  top: 1%;
  left: 1%;
  z-index: 500;
}
</style>
