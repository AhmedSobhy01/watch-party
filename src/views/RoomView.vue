<script setup>
import RoomVideo from "@/components/RoomVideo.vue";
import RoomChat from "@/components/RoomChat.vue";
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import GoBackButton from "@/components/GoBackButton.vue";
import errorImageUrl from "@/assets/images/error.png";
import { useSocketStore } from "@/stores/socket";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";
import { useVideoStore } from "@/stores/video";
import UploadOfflineVideo from "@/components/UploadOfflineVideo.vue";

const router = useRouter();
const socketStore = useSocketStore();
const userStore = useUserStore();
const videoStore = useVideoStore();

const videoUploadIsRequired = ref(false);

const message = ref("Getting room...");
const isError = ref(false);

// ChatBox
const chatBoxElement = ref(null);

// Room Data
const room = ref(null);
const usersCount = ref(1);

// Fetch Room Data
const getRoom = async () => {
    if (!userStore.username) {
        router.replace("/");
        return;
    }

    const roomCode = window.location.pathname.split("/")[2];

    const response = await fetch(`${import.meta.env.VITE_API_URL}/room/join`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomCode }),
    });

    let data;

    try {
        data = await response.json();
    } catch (error) {
        message.value = "Room not found.";
        isError.value = true;
        return;
    }

    if (response.status !== 200 || data.message !== "success") {
        message.value = data.message;
        isError.value = true;
        return;
    }

    room.value = data.room;

    if (room.value.type == "offline" && !videoStore.videoPath) {
        videoUploadIsRequired.value = true;
        return;
    }

    await nextTick();
    joinUser();
};

// Proceed to room if video is uploaded
const proceedToRoom = async () => {
    if (!videoStore.videoPath) return;

    videoUploadIsRequired.value = false;

    await nextTick();
    joinUser();
};

// Initialize Room
const joinUser = () => {
    bindEvents();

    socketStore.socket.emit("new-user-joined", { username: userStore.username, roomCode: room.value.code });

    chatBoxElement.value.appendMessage({
        username: "System",
        text: `Welcome to ${room.value.name}! Enjoy your stay in the room.`,
    });
};

// Bind Events
const bindEvents = () => {
    socketStore.socket.on("user-joined", (data) => {
        chatBoxElement.value.appendMessage({
            username: "System",
            text: `${data.username} joined the party.`,
        });

        usersCount.value = data.members;
    });

    socketStore.socket.on("update-member-count", (data) => (usersCount.value = data.members));

    socketStore.socket.on("user-left", (data) => {
        chatBoxElement.value.appendMessage({
            username: "System",
            text: `${data.username} left the party.`,
        });

        usersCount.value = data.members;
    });

    socketStore.socket.on("user-disconnected", (data) => {
        chatBoxElement.value.appendMessage({
            name: "System",
            text: `${data.username} left the party.`,
        });

        usersCount.value = data.members;
    });
};

const unbindEvents = () => {
    socketStore.socket.off("user-joined");
    socketStore.socket.off("update-member-count");
    socketStore.socket.off("user-left");
    socketStore.socket.off("user-disconnected");
    socketStore.socket.off("player-update");
};

// Video Component
const refreshVideoComponent = ref(false);

const reloadVideoComponent = async () => {
    refreshVideoComponent.value = true;

    await nextTick();

    refreshVideoComponent.value = false;
};

onMounted(() => getRoom());
onUnmounted(() => unbindEvents());
</script>

<template>
    <UploadOfflineVideo v-if="videoUploadIsRequired" :videoLength="room.files[0].length" @proceedToRoom="proceedToRoom" />

    <div v-else-if="!room" class="flex items-center justify-center h-screen flex-col">
        <img :src="errorImageUrl" class="w-32" v-if="isError" />

        <h1 class="text-4xl font-bold">{{ message }}</h1>

        <div v-if="isError" class="mt-5">
            <GoBackButton :showText="true" />
        </div>
    </div>

    <div class="flex lg:items-center flex-col lg:flex-row gap-5 lg:h-screen w-full py-4" v-else>
        <div class="lg:w-4/5 lg:h-full">
            <RoomVideo :roomType="room.type" :roomCode="room.code" :files="room.files" @appendMessage="(message) => chatBoxElement.appendMessage(message)" @reloadComponent="reloadVideoComponent" v-if="!refreshVideoComponent" />
        </div>

        <div class="lg:w-1/5 lg:h-full">
            <RoomChat :roomName="room.name" :roomCode="room.code" :usersCount="usersCount" ref="chatBoxElement" />
        </div>
    </div>
</template>
