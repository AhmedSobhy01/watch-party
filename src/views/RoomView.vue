<script setup>
import RoomVideo from "@/components/RoomVideo.vue";
import RoomChat from "@/components/RoomChat.vue";
import { nextTick, onMounted, ref } from "vue";
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

// Fetch Room Data
const getRoom = async () => {
    const roomCode = router.currentRoute.value.params.roomCode;

    if (!userStore.username) {
        router.replace("/room/join?roomCode=" + roomCode);
        return;
    }

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
    socketStore.socket.emit("new-user-joined", { username: userStore.username, roomCode: room.value.code });

    chatBoxElement.value.appendMessage({
        type: "message",
        data: {
            username: "System",
            text: `👋 Welcome to ${room.value.name}, ${userStore.username}!`,
        },
    });
};

// Refresh Video Component on video change
const refreshVideoComponent = ref(false);

const reloadVideoComponent = async () => {
    refreshVideoComponent.value = true;

    await nextTick();

    refreshVideoComponent.value = false;
};

onMounted(() => getRoom());
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
            <RoomVideo :roomType="room.type" :files="room.files" @appendMessage="(message) => chatBoxElement.appendMessage(message)" @reloadComponent="reloadVideoComponent" v-if="!refreshVideoComponent" />
        </div>

        <div class="lg:w-1/5 lg:h-full">
            <RoomChat :roomName="room.name" :roomCode="room.code" ref="chatBoxElement" />
        </div>
    </div>
</template>
