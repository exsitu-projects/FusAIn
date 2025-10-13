import { createRouter, createWebHistory } from "vue-router";
import UploadPresenter from "../presenters/UploadPresenter.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: UploadPresenter,
    }
  ],
});

export default router;
