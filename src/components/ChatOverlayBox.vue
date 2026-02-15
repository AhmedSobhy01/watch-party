<script setup>
import { computed, nextTick, ref, watch } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faCircleChevronRight, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useChatStore } from "@/stores/chat";
import { useSocketStore } from "@/stores/socket";
import { useUserStore } from "@/stores/user";
import { getCurrentTime } from "@/composables/time";

const emit = defineEmits(["close"]);

const chatStore = useChatStore();
const socketStore = useSocketStore();
const userStore = useUserStore();

const messages = computed(() => chatStore.messages);
const messagesChatContainer = ref(null);

watch(
    () => messages.value.length,
    async () => {
        if (messagesChatContainer.value) {
            await nextTick();
            messagesChatContainer.value.scroll({
                top: messagesChatContainer.value.scrollHeight,
                behavior: "smooth",
            });
        }
    },
);

const messageInput = ref("");
const sendMessage = () => {
    if (!messageInput.value.trim()) return;

    socketStore.socket.emit("send-message", messageInput.value.trim());

    chatStore.addMessage({
        username: userStore.username,
        text: messageInput.value.trim(),
        time: getCurrentTime(),
    });

    messageInput.value = "";
};
</script>

<template>
    <div class="fixed bottom-40 right-4 w-96 h-[500px] bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl flex flex-col overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <h3 class="text-white font-semibold">Chat</h3>
            <button type="button" class="text-gray-400 hover:text-white transition-colors" @click="emit('close')" aria-label="Close chat">
                <FontAwesomeIcon :icon="faXmark" class="w-5 h-5" />
            </button>
        </div>

        <div class="flex-1 overflow-auto px-4 py-3" ref="messagesChatContainer">
            <div class="flex flex-col gap-3">
                <div v-for="(message, index) in messages" :key="index" class="flex gap-2">
                    <div class="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0">
                        <img class="w-full h-full object-cover rounded-full" :src="`https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${message.username}`" alt="Avatar" />
                    </div>

                    <div class="flex-1 flex flex-col gap-1 min-w-0">
                        <div class="flex items-center justify-between gap-2">
                            <div class="font-semibold text-white text-sm truncate">{{ message.username }}</div>
                            <div class="text-gray-400 text-xs flex-shrink-0">{{ message.time }}</div>
                        </div>
                        <div class="text-gray-200 text-sm break-words">{{ message.text }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="px-4 py-3 border-t border-gray-700">
            <form class="relative w-full overflow-hidden" @submit.prevent="sendMessage">
                <input class="pl-3 pr-12 py-2 rounded-lg text-gray-800 outline-none w-full bg-white" type="text" placeholder="Type a message..." autocomplete="off" v-model="messageInput" />
                <button type="submit" class="text-gray-600 hover:text-gray-800 transition-all ease-in-out duration-100 text-xl rounded-full flex items-center justify-center absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FontAwesomeIcon class="h-6 w-6" :icon="faCircleChevronRight" />
                </button>
            </form>
        </div>
    </div>
</template>

<style scoped>
div::-webkit-scrollbar {
    width: 6px;
}

div::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
}

div::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
}

div::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
}
</style>
