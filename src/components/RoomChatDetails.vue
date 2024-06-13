<script setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faSignOutAlt, faUserFriends } from "@fortawesome/free-solid-svg-icons";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

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

const emit = defineEmits(["leave"]);

// Copy Room Code
const copyRoomCode = () => {
    navigator.clipboard.writeText(props.roomCode);
    new Notyf({
        position: { x: "center", y: "top" },
    }).success("Room code copied to clipboard");
};
</script>

<template>
    <div class="text-4xl text-center font-bold border-b-2 pb-3 mb-4">{{ roomName }}</div>

    <div class="flex items-center justify-between gap-3 mb-8">
        <div class="flex items-center gap-2 text-lg select-none">
            <FontAwesomeIcon :icon="faUserFriends" />
            <div class="font-bold">{{ usersCount }}</div>
        </div>

        <div class="text-2xl font-bold select-none cursor-pointer" @click="copyRoomCode">{{ roomCode }}</div>

        <button type="button" class="pl-3" @click="$emit('leave')">
            <FontAwesomeIcon class="text-xl" :icon="faSignOutAlt" />
        </button>
    </div>
</template>
