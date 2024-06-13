import { ref } from "vue";
import { defineStore } from "pinia";

export const useUserStore = defineStore("room", () => {
    const username = ref("");

    const setUsername = (name) => (username.value = name);

    return { username, setUsername };
});
