<script setup>
import { Vue3Lottie } from "vue3-lottie";
import LaughEmojiJSON from "@/assets/emojis/laugh.json";
import AngryEmojiJSON from "@/assets/emojis/angry.json";
import SadEmojiJSON from "@/assets/emojis/sad.json";
import LoveEyesEmojiJSON from "@/assets/emojis/love-eyes.json";
import StarEyesEmojiJSON from "@/assets/emojis/star-eyes.json";
import SurprisedEmojiJSON from "@/assets/emojis/surprised.json";
import { useSocketStore } from "@/stores/socket";

const socketStore = useSocketStore();

const sendEmoji = (emoji) => socketStore.socket.emit("send-emoji", emoji);
</script>

<template>
    <div class="bg-gray-900/90 backdrop-blur-md rounded-full px-4 py-3 shadow-xl">
        <div class="flex items-center gap-5">
            <Vue3Lottie :height="42" :width="42" class="cursor-pointer hover:scale-110 transition-transform" :animationData="LaughEmojiJSON" :loop="true" :playOnHover="true" @click="() => sendEmoji('laugh')" />
            <Vue3Lottie :height="42" :width="42" class="cursor-pointer hover:scale-110 transition-transform" :animationData="AngryEmojiJSON" :loop="true" :playOnHover="true" @click="() => sendEmoji('angry')" />
            <Vue3Lottie :height="42" :width="42" class="cursor-pointer hover:scale-110 transition-transform" :animationData="SadEmojiJSON" :loop="true" :playOnHover="true" @click="() => sendEmoji('sad')" />
            <Vue3Lottie :height="42" :width="42" class="cursor-pointer hover:scale-110 transition-transform" :animationData="LoveEyesEmojiJSON" :loop="true" :playOnHover="true" @click="() => sendEmoji('love-eyes')" />
            <Vue3Lottie :height="42" :width="42" class="cursor-pointer hover:scale-110 transition-transform" :animationData="StarEyesEmojiJSON" :loop="true" :playOnHover="true" @click="() => sendEmoji('star-eyes')" />
            <Vue3Lottie :height="42" :width="42" class="cursor-pointer hover:scale-110 transition-transform" :animationData="SurprisedEmojiJSON" :loop="true" :playOnHover="true" @click="() => sendEmoji('surprised')" />
        </div>
    </div>
</template>
