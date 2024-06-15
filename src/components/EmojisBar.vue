<script setup>
import { onMounted, ref } from "vue";
import KeenSlider from "keen-slider";
import "keen-slider/keen-slider.min.css";
import { Vue3Lottie } from "vue3-lottie";
import LaughEmojiJSON from "@/assets/emojis/laugh.json";
import AngryEmojiJSON from "@/assets/emojis/angry.json";
import SadEmojiJSON from "@/assets/emojis/sad.json";
import LoveEyesEmojiJSON from "@/assets/emojis/love-eyes.json";
import StarEyesEmojiJSON from "@/assets/emojis/star-eyes.json";
import SurprisedEmojiJSON from "@/assets/emojis/surprised.json";
import { useSocketStore } from "@/stores/socket";

const socketStore = useSocketStore();

const containerElement = ref(null);
const containerSlider = ref(null);

const sendEmoji = (emoji) => socketStore.socket.emit("send-emoji", emoji);

onMounted(() => {
    setTimeout(() => {
        containerSlider.value = new KeenSlider(containerElement.value, {
            loop: false,
            mode: "free",
            slides: {
                perView: "auto",
                spacing: window.innerWidth < 1024 ? 35 : 10,
            },
            dragSpeed: 0.5,
            rubberband: true,
        });
    }, 500);
});
</script>

<template>
    <div class="max-h-24 lg:max-h-16 py-2 keen-slider overflow-hidden pr-4" ref="containerElement">
        <Vue3Lottie class="min-w-16 max-w-20 lg:min-w-[4.5rem] cursor-pointer keen-slider__slide" :animationData="LaughEmojiJSON" :loop="true" :playOnHover="true" @click="() => sendEmoji('laugh')" />
        <Vue3Lottie class="min-w-16 max-w-20 lg:min-w-[4.5rem] cursor-pointer keen-slider__slide" :animationData="AngryEmojiJSON" :loop="true" :playOnHover="true" @click="() => sendEmoji('angry')" />
        <Vue3Lottie class="min-w-16 max-w-20 lg:min-w-[4.5rem] cursor-pointer keen-slider__slide" :animationData="SadEmojiJSON" :loop="true" :playOnHover="true" @click="() => sendEmoji('sad')" />
        <Vue3Lottie class="min-w-16 max-w-20 lg:min-w-[4.5rem] cursor-pointer keen-slider__slide" :animationData="LoveEyesEmojiJSON" :loop="true" :playOnHover="true" @click="() => sendEmoji('love-eyes')" />
        <Vue3Lottie class="min-w-16 max-w-20 lg:min-w-[4.5rem] cursor-pointer keen-slider__slide" :animationData="StarEyesEmojiJSON" :loop="true" :playOnHover="true" @click="() => sendEmoji('star-eyes')" />
        <Vue3Lottie class="min-w-16 max-w-20 lg:min-w-[4.5rem] cursor-pointer keen-slider__slide" :animationData="SurprisedEmojiJSON" :loop="true" :playOnHover="true" @click="() => sendEmoji('surprised')" />
    </div>
</template>
