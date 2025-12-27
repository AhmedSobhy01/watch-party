<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faSignOutAlt, faUserFriends } from "@fortawesome/free-solid-svg-icons";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import { useSocketStore } from "@/stores/socket";
import { useUserStore } from "@/stores/user";
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
    membersList: {
        type: Array,
        default: () => [],
    },
});

const router = useRouter();
const socketStore = useSocketStore();
const userStore = useUserStore();
const videoStore = useVideoStore();

const showMembersList = ref(false);

const sortedMembers = computed(() => {
    const currentUser = userStore.username;
    return [...props.membersList].sort((a, b) => {
        if (a === currentUser) return -1;
        if (b === currentUser) return 1;
        return 0;
    });
});

// Copy Room Code
const copyRoomCode = () => {
    navigator.clipboard.writeText(props.roomCode);
    new Notyf({
        position: { x: "center", y: "top" },
    }).success("Room code copied to clipboard");
};

// Leave Room
const leaveRoom = () => {
    socketStore.socket.emit("leave-room");
    userStore.username = "";

    // Reset Video Store
    videoStore.$reset();

    router.replace("/");
};
</script>

<template>
    <div class="text-4xl text-center font-bold border-b-2 pb-3 mb-4">{{ roomName }}</div>

    <div class="flex items-center justify-between gap-3 mb-8">
        <div
            class="relative flex items-center gap-2 text-lg select-none cursor-pointer"
            @mouseenter="showMembersList = true"
            @mouseleave="showMembersList = false"
        >
            <FontAwesomeIcon :icon="faUserFriends" />
            <div class="font-bold">{{ usersCount }}</div>

            <!-- Members List Tooltip -->
            <Transition name="fade">
                <div
                    v-if="showMembersList && membersList.length > 0"
                    class="absolute left-0 top-full mt-2 z-50 bg-gray-800/95 text-white rounded-md shadow-lg py-2 px-3 min-w-32 backdrop-blur-sm"
                >
                    <ul class="space-y-1.5">
                        <li
                            v-for="member in sortedMembers"
                            :key="member"
                            class="text-sm flex items-center gap-2"
                        >
                            <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                            <span :class="{ 'font-medium': member === userStore.username }">{{ member }}</span>
                            <span v-if="member === userStore.username" class="text-xs text-gray-400">(You)</span>
                        </li>
                    </ul>
                </div>
            </Transition>
        </div>

        <div class="text-2xl font-bold select-none cursor-pointer" @click="copyRoomCode">{{ roomCode }}</div>

        <button type="button" class="pl-3" @click="leaveRoom">
            <FontAwesomeIcon class="text-xl" :icon="faSignOutAlt" />
        </button>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}
</style>
