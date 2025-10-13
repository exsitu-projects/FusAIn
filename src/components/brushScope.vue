<script>
import { useCanvas } from "@/stores/canvasStore";
import ColorPalette from "@/components/colorPalette.vue";

export default {
  name: "brushScope",
  components: { ColorPalette },
  setup() {
    const canvasStore = useCanvas();
    let brush = canvasStore.brush;
    return { canvasStore, brush };
  },
};
</script>

<template>
  <div class="my-1 card prevent-select card-body brush-scope">
    <p>
      Current Pen: <b>{{ canvasStore.getPenName() }}</b>
    </p>
    <div
      v-if="
        canvasStore.currentPenId === 0 &&
        canvasStore.currentSelectionId !== null
      "
    >
      <img
        :src="
          canvasStore.extractImgArr[canvasStore.currentSelectionId].imagePath
        "
        alt="extracted image"
      />
    </div>
    <div
      v-if="canvasStore.currentPenId === 1 || canvasStore.currentPenId === 2"
    >
      <div class="row">
        <div class="col-auto">
          <div style="width: 100px; height: 100px">
            <div
              class="blurry-circle mx-auto"
              :style="
                'background:' +
                canvasStore.brush.color +
                ';width:' +
                canvasStore.brush.size +
                'px;height:' +
                canvasStore.brush.size +
                'px;'
              "
            ></div>
          </div>
        </div>
        <div class="col-auto">
          <label class="card-subtitle" for="drawing-line-width"
            >Size: {{ canvasStore.brush.size }}</label
          >
          <br /><input
            type="range"
            v-model="canvasStore.brush.size"
            min="0"
            max="100"
            id="drawing-line-width"
          /><br />
          <label class="card-subtitle prevent-select" for="drawing-color"
            >Color:</label
          ><br />
          <input
            @click="canvasStore.colorSource = 0"
            type="color"
            v-model="canvasStore.brush.color"
            id="drawing-color"
          /><br />
          <colorPalette />
        </div>
      </div>
    </div>

    <div
      v-if="
        canvasStore.currentPenId === 3 && canvasStore.currentExtractPath !== ''
      "
    >
      <div class="row">
        <div class="col-auto">
          <img :src="canvasStore.currentExtractPath" alt="texture pattern" />
        </div>
        <div class="col-auto">
          <br /><label for="drawing-line-width"
            >Size: {{ canvasStore.brush.size }}</label
          >
          <br /><input
            type="range"
            v-model="canvasStore.brush.size"
            min="0"
            max="400"
            id="drawing-line-width"
          /><br />
          <br /><label for="drawing-line-width"
            >Texture Gap: {{ canvasStore.brush.gap }}</label
          >
          <br /><input
            type="range"
            v-model="canvasStore.brush.gap"
            min="0"
            max="20"
            id="drawing-line-width"
          /><br />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blurry-circle {
  border-radius: 50%; /* Makes the shape a circle */
  filter: blur(1px);
  max-width: 100px;
}
.brush-scope {
  width: 470px;
  float: right;
}
</style>
