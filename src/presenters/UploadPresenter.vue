<template>
  <UploadView
    :canvasObejcts="this.canvasStore.imageObjectList"
    :textObjects="this.canvasStore.textObjectList"
    :updatedBgColor="this.canvasStore.updatedBgColor"
    :canvasColourList="this.canvasStore.colourOnCanvasList"
    :isDragging="this.canvasStore.isDragging"
    @onOpenCanvasClick="this.canvasStore.oneCanvasClick"
    @onDragCanvas="this.canvasStore.dragColourCanvas"
    @onDropColour="this.canvasStore.dropColour"
    @onDecideObject="this.canvasStore.decideObject"
    @onSelectFile="this.canvasStore.selectFile"
    @onSubmitFile="this.canvasStore.submitFile"
    @onCallDragStartCanvas="canvasStore.startDragging"
    @onDragEnd="canvasStore.stopDragging"
  ></UploadView>

</template>

<script>
import UploadView from "@/views/UploadView.vue";
import { useCanvas } from "@/stores/canvasStore";
export default {
  components: { UploadView },
  name: "UploadPresenter",
  setup() {
    const canvasStore = useCanvas();
    return { canvasStore };
  },
};
</script>

<style scoped></style>
