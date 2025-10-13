<script setup>
import UploadPresenter from "@/presenters/UploadPresenter.vue";
import CanvasPresenter from "@/presenters/CanvasPresenter.vue";
</script>

<template>
  <div>
    <div class="row" style="height: 100vh; width: 100vw">
      <UploadPresenter style="width: 22vw"></UploadPresenter>
      <CanvasPresenter style="width: 78vw"></CanvasPresenter>
    </div>
  </div>
</template>
