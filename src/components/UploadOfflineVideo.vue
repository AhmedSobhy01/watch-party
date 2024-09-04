<script setup>
import { ref } from "vue";
import { useVideoStore } from "@/stores/video";
import { formatTimeFromSeconds } from "@/composables/time";

const props = defineProps({
    videoLength: {
        type: Number,
    },
});

const emit = defineEmits(["proceedToRoom"]);

const videoStore = useVideoStore();

const errorMessage = ref("Please upload a video file.");
const videoFile = ref(null);

const validateVideoFile = () => {
    if (!videoFile.value.files[0]) {
        errorMessage.value = "Please select a video file.";
        return false;
    }

    if (videoFile.value.files[0].type.split("/")[0] !== "video") {
        errorMessage.value = "Please select a video file.";
        return false;
    }

    errorMessage.value = "";
    return true;
};

const getVideoLength = () => {
    const file = videoFile.value.files[0];

    if (!file) {
        errorMessage.value = "Please upload a video file.";
        return;
    }

    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
        if (Math.round(video.duration) == props.videoLength) {
            errorMessage.value = "";
            videoStore.setVideoPath(URL.createObjectURL(file));
        } else {
            errorMessage.value = `Video length must be ${formatTimeFromSeconds(props.videoLength)}`;
        }
    };
};

const onChangeVideoFileHandler = () => {
    if (validateVideoFile()) getVideoLength();
};
</script>

<template>
    <div class="flex flex-col items-center justify-center max-w-sm mx-auto h-screen gap-5">
        <input type="file" ref="videoFile" @change="onChangeVideoFileHandler" class="border p-3" />

        <p class="text-red-500">{{ errorMessage }}</p>

        <button type="button" class="bg-green-500 text-white px-4 py-2.5 rounded-lg text-lg font-medium transition-all ease-in-out duration-100" :class="{ 'cursor-not-allowed bg-opacity-50': errorMessage, 'hover:bg-green-600': !errorMessage }" :disabled="errorMessage != ''" @click="emit('proceedToRoom')">Proceed</button>
    </div>
</template>
