<script setup>
import { Vue3Lottie } from "vue3-lottie";
import LaughEmojiJSON from "@/assets/emojis/laugh.json";
import AngryEmojiJSON from "@/assets/emojis/angry.json";
import SadEmojiJSON from "@/assets/emojis/sad.json";
import LoveEyesEmojiJSON from "@/assets/emojis/love-eyes.json";
import StarEyesEmojiJSON from "@/assets/emojis/star-eyes.json";
import SurprisedEmojiJSON from "@/assets/emojis/surprised.json";
import { useSocketStore } from "@/stores/socket";
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
    playerContainer: {
        type: Object,
    },
});

const socketStore = useSocketStore();
const containerElement = ref(null);

const playerHeight = ref(0);

const emojis = ref([]);
const animationDuration = 5000;

// Show emoji
const showEmoji = (emojiJSON, username) => {
    console.log(username);
    emojis.value.push({
        id: Date.now(),
        json: emojiJSON,
        username,
        createdAt: Date.now(),
    });
};

// Bind and unbind socket events
const bindEvents = () => {
    socketStore.socket.on("new-emoji", (data) => {
        switch (data.emoji) {
            case "laugh":
                showEmoji(LaughEmojiJSON, data.username);
                break;
            case "angry":
                showEmoji(AngryEmojiJSON, data.username);
                break;
            case "sad":
                showEmoji(SadEmojiJSON, data.username);
                break;
            case "love-eyes":
                showEmoji(LoveEyesEmojiJSON, data.username);
                break;
            case "star-eyes":
                showEmoji(StarEyesEmojiJSON, data.username);
                break;
            case "surprised":
                showEmoji(SurprisedEmojiJSON, data.username);
                break;

            default:
                break;
        }
    });
};

const unbindEvents = () => socketStore.socket.off("new-emoji");

onMounted(() => {
    bindEvents();

    setInterval(() => {
        // Set player height and animation properties
        playerHeight.value = props.playerContainer.clientHeight;
        document.documentElement.style.setProperty("--float-up-animation-duration", `${animationDuration}ms`);
        document.documentElement.style.setProperty("--float-up-animation-height", `-${playerHeight.value + 100}px`);

        // Remove emojis after animation duration
        emojis.value.forEach((emoji) => {
            if (Date.now() - emoji.createdAt >= animationDuration) emojis.value = emojis.value.filter((e) => e.id !== emoji.id);
        });
    }, 1000);
});

onBeforeUnmount(() => unbindEvents());
</script>

<template>
    <div class="relative" ref="containerElement">
        <div v-for="emoji in emojis" :key="emoji.id" class="flex items-center justify-center flex-col absolute float-emoji">
            <Vue3Lottie :animationData="emoji.json" :loop="true" :autoplay="true" :width="75" :height="75" />
            <div class="text-xs text-white bg-black bg-opacity-50 px-2 rounded-bl-lg rounded-tr-lg py-0.5">{{ emoji.username }}</div>
        </div>
    </div>
</template>

<style>
.float-emoji {
    animation-name: float-up-animation;
    animation-fill-mode: forwards;
    animation-duration: var(--float-up-animation-duration);
    animation-timing-function: ease-out;
}

@keyframes float-up-animation {
    from {
        transform: translateY(0);
    }
    to {
        transform: translateY(var(--float-up-animation-height));
    }
}
</style>
