import "./assets/css/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { useVideoStore } from "./stores/video";

document.title = import.meta.env.VITE_APP_NAME;

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");

// Reset video store on page navigation
router.afterEach(() => useVideoStore().$reset());
