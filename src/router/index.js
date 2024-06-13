import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "home",
            component: () => import("@/views/HomeView.vue"),
        },
        {
            path: "/room/create",
            name: "create-room",
            component: () => import("@/views/CreateRoomView.vue"),
        },
        {
            path: "/room/join",
            name: "join-room",
            component: () => import("@/views/JoinRoomView.vue"),
        },
        {
            path: "/room/:roomCode",
            name: "room",
            component: () => import("@/views/RoomView.vue"),
        },

        // Redirect to home if no route matches
        {
            path: "/:pathMatch(.*)*",
            redirect: { name: "home" },
        },
    ],
});

export default router;
