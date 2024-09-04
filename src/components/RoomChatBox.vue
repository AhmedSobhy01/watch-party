<script setup>
import { nextTick, ref, watch } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faCircleChevronRight } from "@fortawesome/free-solid-svg-icons";
import EmojisBar from "@/components/EmojisBar.vue";

const props = defineProps({
    messages: {
        type: Array,
    },
    logMessages: {
        type: Array,
    },
});

const emit = defineEmits(["send"]);

const chatType = ref("messages");

const messagesChatContainer = ref(null);
const logChatContainer = ref(null);

watch(
    () => props.messages.length,
    async () => {
        if (messagesChatContainer.value) {
            await nextTick();
            messagesChatContainer.value.scroll({
                top: messagesChatContainer.value.scrollHeight,
                behavior: "smooth",
            });
        }
    }
);

watch(
    () => props.logMessages.length,
    async () => {
        if (logChatContainer.value) {
            await nextTick();
            logChatContainer.value.scroll({
                top: logChatContainer.value.scrollHeight,
                behavior: "smooth",
            });
        }
    }
);

// Send Message
const messageInput = ref(null);
const sendMessage = () => {
    if (!messageInput.value.trim()) return;

    emit("send", messageInput.value.trim());
    messageInput.value = "";
};
</script>

<template>
    <div class="flex-1 flex flex-col gap-6 overflow-auto">
        <div class="bg-gray-800 rounded-2xl">
            <nav class="flex flex-col sm:flex-row rounded-2xl">
                <button type="button" class="flex-1 transition-all duration-100 ease-in-out py-4 px-6 block hover:text-blue-500 focus:outline-none outline-none border-b-2 rounded-l-2xl" :class="[chatType == 'messages' ? 'text-blue-500 font-medium border-blue-500' : 'text-gray-600 border-gray-800']" @click="chatType = 'messages'">Messages</button>
                <button type="button" class="flex-1 transition-all duration-100 ease-in-out py-4 px-6 block hover:text-blue-500 focus:outline-none outline-none border-b-2 rounded-r-2xl" :class="[chatType == 'logs' ? 'text-blue-500 font-medium border-blue-500' : 'text-gray-600 border-gray-800']" @click="chatType = 'logs'">Log</button>
            </nav>
        </div>

        <div class="flex-1 overflow-auto pr-4" ref="messagesChatContainer" v-if="chatType == 'messages'">
            <div class="flex flex-col gap-3">
                <div v-for="message in messages" :key="message" class="flex gap-3">
                    <div class="w-10 h-10 bg-gray-300 rounded-full">
                        <img class="w-full h-full object-cover rounded-full" :src="`https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${message.username}`" />
                    </div>

                    <div class="flex-1 flex flex-col gap-1">
                        <div class="flex items-center justify-between">
                            <div class="font-bold">{{ message.username }}</div>
                            <div class="font-bold">{{ message.time }}</div>
                        </div>
                        <div>{{ message.text }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex-1 overflow-auto pr-4" ref="logChatContainer" v-else>
            <div class="flex flex-col gap-3">
                <div v-for="log in logMessages" :key="log" class="flex gap-3">
                    <div class="w-10 h-10 bg-gray-300 rounded-full">
                        <img class="w-full h-full object-cover rounded-full" :src="`https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${log.username}`" />
                    </div>

                    <div class="flex-1 flex flex-col gap-1">
                        <div class="flex items-center justify-between">
                            <div class="font-bold">{{ log.username }}</div>
                            <div class="font-bold">{{ log.time }}</div>
                        </div>
                        <div>{{ log.text }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="border-t flex flex-col gap-3">
            <EmojisBar />

            <form class="relative w-full overflow-hidden" @submit.prevent="sendMessage">
                <input class="pl-3 pr-12 py-2 rounded-lg text-gray-800 outline-none w-full" type="text" placeholder="Message" autocomplete="off" v-model="messageInput" />
                <button type="submit" class="text-gray-600 hover:text-gray-800 transition-all ease-in-out duration-100 text-xl rounded-full flex items-center justify-center absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FontAwesomeIcon class="h-7 w-7" :icon="faCircleChevronRight" />
                </button>
            </form>
        </div>
    </div>
</template>
