import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/:relogin?",
    name: "login",
    meta: {
      title: "首页",
    },
    component: () => import("../views/login.vue"),
  },
  {
    path: "/setup",
    name: "setup",
    component: () => import("../views/setup/center.vue"),
  },
  {
    path: "/vmlist",
    name: "vmlist",
    component: () => import("../views/vmlist.vue"),
  },
  {
    path: "/help",
    name: "help",
    component: () => import("../views/help.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "notFound",
    meta: {
      title: "404页面不存在",
    },
    component: () => import("../views/login.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
