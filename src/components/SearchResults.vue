<template>
  <div>
    <div class="input-group pb-4">
      <input
        type="text"
        class="form-control border-dark bg-transparent"
        placeholder="Search images..."
        @keyup="enterPressed"
        v-model="this.query"
      />
      <button type="button" class="btn btn-outline-dark" @click="search">
        Search
      </button>
    </div>
    <div class="card m-1 p-1" id="success-message">
      Image downloaded successfully!
    </div>
    <div style="overflow-y: scroll; overflow-x: hidden; max-height: 100vh">
      <div class="row align-items-center bar">
        <img
          v-for="(image, index) of canvasStore.searchImgList"
          :key="index"
          @click="triggerImgDownload(index)"
          draggable="true"
          class="p-2 rounded-4 lh-sm d-flex w-100"
          :src="image.url"
          alt="search results"
          style="z-index: 100"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { useCanvas } from "@/stores/canvasStore";

export default {
  name: "SearchResults",
  setup() {
    const canvasStore = useCanvas();
    return { canvasStore };
  },

  methods: {
    search() {
      this.canvasStore.doSearch(this.query);
    },
    triggerImgDownload(id) {
      this.canvasStore.imgDownload(id);
    },
    enterPressed(evt) {
      const ENTER_KEY_CODE = 13;
      if (evt.keyCode === ENTER_KEY_CODE) {
        console.log("key pressed");
        this.search();
      }
    },
  },

  data() {
    return { query: "" };
  },
};
</script>

<style scoped>
.searchbar {
  width: 21vw;
  position: fixed;
  z-index: 10;
}
.bar {
  max-height: 70vh;
}
#success-message {
  display: none;
  color: green;
  position: fixed;
  z-index: 1000;
}
</style>
