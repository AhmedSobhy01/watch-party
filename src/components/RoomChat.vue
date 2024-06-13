<script setup>
import RoomChatDetails from "./RoomChatDetails.vue";
import RoomChatBox from "./RoomChatBox.vue";
import { onMounted, onUnmounted, ref } from "vue";
import { useUserStore } from "@/stores/user";
import { useSocketStore } from "@/stores/socket";
import { useRouter } from "vue-router";
import { useVideoStore } from "@/stores/video";

const props = defineProps({
    roomName: {
        type: String,
    },
    roomCode: {
        type: String,
    },
    usersCount: {
        type: Number,
    },
});

const router = useRouter();
const socketStore = useSocketStore();
const userStore = useUserStore();
const videoStore = useVideoStore();

// Leave Room
const leaveRoom = () => {
    socketStore.socket.emit("leave-room");
    userStore.username = "";

    // Reset Video Store
    videoStore.$reset();

    router.replace("/");
};

// ChatBox
const messages = ref([]);
const appendMessage = (data) => messages.value.push(data);

// ChatBox Socket Events
const bindEvents = () => {
    socketStore.socket.on("new-message", (data) => {
        appendMessage({
            username: data.username,
            text: data.message,
        });
    });
};

const unbindEvents = () => {
    socketStore.socket.off("new-message");
};
// ChatBox Methods
const sendMessage = (message) => {
    socketStore.socket.emit("send-message", message);

    appendMessage({
        username: userStore.username,
        text: message,
    });
};

// ChatBox Exposed Methods
defineExpose({
    appendMessage,
});

onMounted(() => bindEvents());
onUnmounted(() => unbindEvents());
</script>

<template>
    <div class="h-full flex flex-col">
        <RoomChatDetails :roomName="roomName" :roomCode="roomCode" :usersCount="usersCount" @leave="leaveRoom" />
        <RoomChatBox :messages="messages" @send="sendMessage" />
    </div>
</template>
