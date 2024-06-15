<script setup>
import RoomChatDetails from "./RoomChatDetails.vue";
import RoomChatBox from "./RoomChatBox.vue";
import { onMounted, onUnmounted, ref } from "vue";
import { useUserStore } from "@/stores/user";
import { useSocketStore } from "@/stores/socket";
import { useRouter } from "vue-router";
import { useVideoStore } from "@/stores/video";
import { getCurrentTime } from "@/composables/time";

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
const logMessages = ref([]);

const appendMessage = ({ type, data }) => {
    if (type == "message") messages.value.push({ ...data, time: getCurrentTime() });
    else if (type == "log") logMessages.value.push({ ...data, time: getCurrentTime() });
};

// ChatBox Socket Events
const bindEvents = () => {
    socketStore.socket.on("new-message", (data) => {
        appendMessage({
            type: "message",
            data: {
                username: data.username,
                text: data.message,
            },
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
        type: "message",
        data: {
            username: userStore.username,
            text: message,
        },
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
        <RoomChatBox :messages="messages" :logMessages="logMessages" @send="sendMessage" />
    </div>
</template>
