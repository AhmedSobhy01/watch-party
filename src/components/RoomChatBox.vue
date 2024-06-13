<script setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faCircleChevronRight } from "@fortawesome/free-solid-svg-icons";
import { nextTick, ref, watch } from "vue";

const props = defineProps({
    messages: {
        type: Array,
    },
});

const emit = defineEmits(["send"]);

const chatContainer = ref(null);

watch(
    () => props.messages.length,
    async () => {
        if (chatContainer.value) {
            await nextTick();
            chatContainer.value.scroll({
                top: chatContainer.value.scrollHeight,
                behavior: "smooth",
            });
        }
    }
);

// Send Message
const messageInput = ref(null);
const sendMessage = () => {
    if (!messageInput.value.trim()) return;

    emit("send", messageInput.value);
    messageInput.value = "";
};
</script>

<template>
    <div class="flex-1 flex flex-col gap-6 overflow-auto">
        <div class="text-xl font-bold">Chat</div>

        <div class="flex-1 overflow-auto pr-4" ref="chatContainer">
            <div class="flex flex-col gap-3">
                <div v-for="message in messages" :key="message" class="flex gap-3">
                    <div class="w-10 h-10 bg-gray-300 rounded-full">
                        <img class="w-full h-full object-cover rounded-full" :src="`https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${message.username}`" />
                    </div>

                    <div class="flex-1 flex flex-col gap-1">
                        <div class="flex items-center justify-between">
                            <div class="font-bold">{{ message.username }}</div>
                        </div>
                        <div>{{ message.text }}</div>
                    </div>
                </div>
            </div>
        </div>

        <form class="relative w-full overflow-hidden" @submit.prevent="sendMessage">
            <input class="pl-3 pr-12 py-2 rounded-lg text-gray-800 outline-none w-full" type="text" placeholder="Message" autocomplete="off" v-model="messageInput" />

            <button type="submit" class="text-gray-600 hover:text-gray-800 transition-all ease-in-out duration-100 text-xl rounded-full flex items-center justify-center absolute right-3 top-1/2 transform -translate-y-1/2">
                <FontAwesomeIcon class="h-7 w-7" :icon="faCircleChevronRight" />
            </button>
        </form>
    </div>
</template>
