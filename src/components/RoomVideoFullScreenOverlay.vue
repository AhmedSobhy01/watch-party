<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faMessage } from "@fortawesome/free-solid-svg-icons";
import EmojisOverlay from "@/components/EmojisOverlay.vue";
import ChatOverlayBox from "@/components/ChatOverlayBox.vue";
import RoomVideoEmojis from "@/components/RoomVideoEmojis.vue";
import { useChatStore } from "@/stores/chat";
import { useSocketStore } from "@/stores/socket";

const props = defineProps({
    showControls: {
        type: Boolean,
        required: true,
    },
    isPlaying: {
        type: Boolean,
        required: true,
    },
    playerContainer: {
        type: Object,
        required: false,
    },
});

const chatStore = useChatStore();
const socketStore = useSocketStore();

const isChatOpen = computed({
    get: () => chatStore.isFullScreenChatOpen,
    set: (value) => chatStore.setFullScreenChatOpen(value),
});

const unreadCount = computed(() => chatStore.unreadCount);

const latestUnreadCount = ref(0); // use it to pass to ChatOverlayBox to have latest unread count
const toggleChat = () => {
    if (!isChatOpen.value) latestUnreadCount.value = chatStore.unreadCount;

    isChatOpen.value = !isChatOpen.value;
};

const isFullscreen = ref(false);
const checkFullscreen = () => {
    const prev = isFullscreen.value;
    isFullscreen.value = !!document.fullscreenElement;

    // If going to fullscreen, clear unread count
    if (!prev && isFullscreen.value) {
        chatStore.setChatVisible(false);
        chatStore.clearUnreadCount();
    }
    // If exiting fullscreen, show regular chat again
    else if (prev && !isFullscreen.value) {
        chatStore.setChatVisible(true);
    }
};

const notificationSound = ref(null);
const playNotificationSound = () => {
    if (notificationSound.value && isFullscreen.value && !isChatOpen.value) {
        notificationSound.value.play().catch(() => {});
    }
};

const handleNewMessage = () => {
    playNotificationSound();
};

onMounted(() => {
    document.addEventListener("fullscreenchange", checkFullscreen);
    checkFullscreen();

    if (socketStore.socket) socketStore.socket.on("new-message", handleNewMessage);
});

onBeforeUnmount(() => {
    document.removeEventListener("fullscreenchange", checkFullscreen);

    if (socketStore.socket) socketStore.socket.off("new-message", handleNewMessage);
});
</script>

<template>
    <div>
        <Transition name="fade">
            <div v-if="isFullscreen" class="fixed bottom-3 right-32 z-[2000]">
                <RoomVideoEmojis :playerContainer="playerContainer" />
            </div>
        </Transition>

        <Transition name="fade">
            <div
                v-if="isFullscreen"
                class="fixed bottom-20 right-4 z-40 flex flex-row items-end gap-2 transition-all duration-300"
                :class="{
                    'opacity-0 pointer-events-none': !showControls && isPlaying && !isChatOpen,
                    'opacity-100': showControls || !isPlaying || isChatOpen,
                }"
            >
                <div class="absolute bottom-0 right-full pr-3">
                    <EmojisOverlay />
                </div>

                <div class="relative">
                    <button type="button" class="w-16 h-16 rounded-full bg-gray-900/70 backdrop-blur-md text-white flex items-center justify-center hover:bg-gray-900/90 transition-all duration-300 shadow-lg hover:shadow-xl" @click="toggleChat" aria-label="Open chat">
                        <FontAwesomeIcon :icon="faMessage" class="w-6 h-6" />
                        <Transition name="badge-pop">
                            <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 min-w-[1.25rem] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                                {{ unreadCount > 99 ? "99+" : unreadCount }}
                            </span>
                        </Transition>
                    </button>
                </div>

                <Transition name="slide-right-fade">
                    <ChatOverlayBox v-if="isChatOpen" :unreadCount="latestUnreadCount" @close="toggleChat" />
                </Transition>

                <audio ref="notificationSound" preload="auto">
                    <source src="/notification.mp3" type="audio/mpeg" />
                </audio>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-left-fade-enter-active,
.slide-left-fade-leave-active {
    transition: all 0.2s ease;
}

.slide-left-fade-enter-from,
.slide-left-fade-leave-to {
    opacity: 0;
    transform: translateX(20px);
}

.slide-right-fade-enter-active,
.slide-right-fade-leave-active {
    transition: all 0.3s ease;
}

.slide-right-fade-enter-from,
.slide-right-fade-leave-to {
    opacity: 0;
    transform: translateX(20px);
}

.badge-pop-enter-active {
    animation: badge-pop 0.3s ease;
}

.badge-pop-leave-active {
    transition: all 0.2s ease;
}

.badge-pop-leave-to {
    opacity: 0;
    transform: scale(0.5);
}

@keyframes badge-pop {
    0% {
        opacity: 0;
        transform: scale(0);
    }
    50% {
        transform: scale(1.2);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}
</style>
