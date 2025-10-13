import "./css/main.css";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "vue-color-kit/dist/vue-color-kit.css";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { library } from "@fortawesome/fontawesome-svg-core";
import VueDragResize from "vue-drag-resize";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faUpload,
  faTrash,
  faMagnifyingGlass,
  faCheck,
  faXmark,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
const pinia = createPinia();
const app = createApp(App).component("font-awesome-icon", FontAwesomeIcon);

/* add icons to the library */
library.add(
  faArrowLeft,
  faArrowRight,
  faUpload,
  faTrash,
  faMagnifyingGlass,
  faCheck,
  faXmark,
  faPlus,
);

app.component(VueDragResize);
app.use(router);
app.use(pinia);
app.mount("#app");
