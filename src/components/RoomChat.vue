<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import RoomDetails from "@/components/RoomDetails.vue";
import RoomChatBox from "@/components/RoomChatBox.vue";
import { useUserStore } from "@/stores/user";
import { useSocketStore } from "@/stores/socket";
import { useVideoStore } from "@/stores/video";
import { getCurrentTime } from "@/composables/time";

const props = defineProps({
    roomName: {
        type: String,
    },
    roomCode: {
        type: String,
    },
});

const router = useRouter();
const socketStore = useSocketStore();
const userStore = useUserStore();
const videoStore = useVideoStore();

// Users Count
const usersCount = ref(1);
const membersList = ref([]);

// ChatBox
const messages = ref([]);
const logMessages = ref([]);

const appendMessage = ({ type, data }) => {
    if (type == "message") messages.value.push({ ...data, time: getCurrentTime() });
    else if (type == "log") logMessages.value.push({ ...data, time: getCurrentTime() });
};

// ChatBox Socket Events
const bindEvents = () => {
    socketStore.socket.on("user-joined", (data) => {
        appendMessage({
            type: "message",
            data: {
                username: data.username,
                text: `joined the party`,
            },
        });

        usersCount.value = data.members;
        membersList.value = data.membersList || [];
    });

    socketStore.socket.on("user-left", (data) => {
        appendMessage({
            type: "message",
            data: {
                username: data.username,
                text: "left the party",
            },
        });

        usersCount.value = data.members;
        membersList.value = data.membersList || [];
    });

    socketStore.socket.on("user-disconnected", (data) => {
        appendMessage({
            type: "message",
            data: {
                name: data.username,
                text: "left the party",
            },
        });

        usersCount.value = data.members;
        membersList.value = data.membersList || [];
    });

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
    socketStore.socket.off("user-joined");
    socketStore.socket.off("user-left");
    socketStore.socket.off("user-disconnected");
    socketStore.socket.off("player-update");
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
        <RoomDetails :roomName="roomName" :roomCode="roomCode" :usersCount="usersCount" :membersList="membersList" />
        <RoomChatBox :messages="messages" :logMessages="logMessages" @send="sendMessage" />
    </div>
</template>
