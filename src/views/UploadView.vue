<script>
import InspiringElement from "@/components/inspiringElement.vue";
import { useCanvas } from "@/stores/canvasStore";
import Modal from "@/components/modal.vue";
import { ref } from "vue";
import SearchResults from "@/components/SearchResults.vue";
export default {
  name: "UploadView",
  components: {
    SearchResults,
    Modal,
    InspiringElement,
  },

  setup() {
    const canvasStore = useCanvas();
    const draggable = true;
    const throttleDrag = 1;
    const edgeDraggable = false;
    const startDragRotate = 0;
    const throttleDragRotate = 0;
    const targetRef = ref(null);
    let isDrawing = false;
    let points = [];
    let imgData = null;

    return {
      targetRef,
      draggable,
      throttleDrag,
      edgeDraggable,
      startDragRotate,
      throttleDragRotate,
      canvasStore,
      isDrawing,
      points,
      imgData,
    };
  },
  data() {
    return {
      palette: [],
    };
  },
  emits: [
    "onOpenCanvasClick",
    "onColourOnDrag",
    "onDragCanvas",
    "onStoreImageTrackCoord",
    "onDecideObject",
    "onSubmitFile",
    "onCallDragStartCanvas",
    "onDragEnd",
  ],
  methods: {
    async submitFile() {
      this.$emit("onSubmitFile");
    },
  },
  updated() {},
};
</script>
<template>
  <!-- Modal -->
  <div style="overflow-y: scroll; overflow-x: hidden; max-height: 100vh">
    <Modal />
    <div v-show="canvasStore.imgSource === 0">
      <InspiringElement
        style="top: 12vh"
        v-for="(object, index) of canvasStore.imageObjectList"
        :key="index"
        :source="object.url"
        :w="object.w"
        :h="object.h"
        :id="index"
      />
    </div>
    <div v-show="canvasStore.imgSource === 1">
      <SearchResults />
    </div>
  </div>
</template>
<style></style>
