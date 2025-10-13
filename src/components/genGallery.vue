<script>
import { useCanvas } from "@/stores/canvasStore";

export default {
  name: "genGallery",
  setup() {
    const canvasStore = useCanvas();
    return { canvasStore };
  },
  methods: {
    async saveGeneration() {
      await this.canvasStore.saveGeneration();
    },
  },
};
</script>

<template>
  <div class="row p-1">
    <div class="border border-1 border-black rounded gallery-container">
      <button class="btn btn-light m-1" @click="saveGeneration">
        <font-awesome-icon icon="fa-solid fa-plus"></font-awesome-icon>
      </button>
      <a
        v-for="(ele, index) of canvasStore.galleryImgArr"
        :href="ele.path"
        download
        :key="index"
        class="image-link"
      >
        <img
          width="80"
          height="80"
          :src="ele.path"
          class="m-1 rounded"
          alt="..."
        />
      </a>
    </div>
  </div>
</template>

<style>
.image-link::after {
  content: "Click to download";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.6); /* Semi-transparent background */
  color: white;
  padding: 10px;
  border-radius: 5px;
  opacity: 0;
  transition: opacity 0.3s ease;
  font-size: 1.2em;
  text-align: center;
  white-space: nowrap;
}

.image-link:hover::after {
  opacity: 1;
}
.gallery-container {
  min-height: 50px;
}
</style>
