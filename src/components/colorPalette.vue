<template>
  <div class="row justify-content-center my-1">
    <button
      v-for="(object, index) of canvasStore.currentColorPalette"
      :key="index"
      class="btn circle my-auto mx-1"
      :style="'background-color:rgb(' + object + ')'"
      @click="setCurrentColor(index)"
    ></button>
  </div>
</template>

<script>
import { useCanvas } from "@/stores/canvasStore";
export default {
  name: "colorPalette",
  setup() {
    const canvasStore = useCanvas();
    return { canvasStore };
  },
  emits: ["setCurrentColor"],
  props: {},
  methods: {
    setCurrentColor(index) {
      this.canvasStore.setCurrentColor(index);
    },
  },
  data() {
    return {};
  },
};
</script>

<style scoped>
.info-bar {
  width: 48vw;
  min-height: 10vh;
  background-color: #e8e5dd;
}
.circle {
  border-radius: 50%;
  width: 30px;
  height: 30px;
  z-index: 100;
}
button:focus {
  width: 50px;
  height: 50px;
}
</style>
