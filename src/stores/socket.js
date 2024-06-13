import { defineStore } from "pinia";
import { ref } from "vue";
import { io } from "socket.io-client";

export const useSocketStore = defineStore("socket", () => {
    const socket = ref(null);
    const connected = ref(false);
    const error = ref(false);

    const connect = () => {
        socket.value = io(import.meta.env.VITE_API_URL);

        socket.value.on("connect", () => {
            error.value = false;
            connected.value = true;
        });

        socket.value.on("connect_error", (err) => {
            error.value = true;
            connected.value = false;
        });

        socket.value.on("disconnect", () => {
            error.value = true;
            connected.value = false;
        });
    };

    const disconnect = () => {
        if (socket.value) {
            socket.value.disconnect();
            socket.value = null;
            error.value = false;
            connected.value = false;
            s;
        }
    };

    return { socket, connected, error, connect, disconnect };
});
