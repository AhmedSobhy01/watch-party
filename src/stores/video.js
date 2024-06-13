import { ref } from "vue";
import { defineStore } from "pinia";

export const useVideoStore = defineStore("video", () => {
    const videoPath = ref(null);
    const setVideoPath = (path) => (videoPath.value = path);

    const offlineCaptionFiles = ref([]);
    const addOfflineCaptionFile = (caption) => offlineCaptionFiles.value.push(caption);

    const latestVideoTime = ref(0);
    const setLatestVideoTime = (time) => (latestVideoTime.value = time);

    const $reset = () => {
        videoPath.value = null;
        offlineCaptionFiles.value = [];
        latestVideoTime.value = 0;
    };

    return { videoPath, setVideoPath, offlineCaptionFiles, addOfflineCaptionFile, latestVideoTime, setLatestVideoTime, $reset };
});
