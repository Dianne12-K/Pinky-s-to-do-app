import { createRouter, createWebHistory } from "vue-router";
import HomePage from "./components/HomePage.vue";
import TaskPage from "./components/TaskPage.vue";

const routes = [
  { path: "/", component: HomePage },
  { path: "/tasks", component: TaskPage }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
