import { ref } from "vue";
import { defineStore } from "pinia";

export const useVideoStore = defineStore("video", () => {
    const shouldReset = ref(true);

    const videoPath = ref(null);
    const setVideoPath = (path) => {
        videoPath.value = path;
        shouldReset.value = false;
    };

    const offlineCaptionFiles = ref([]);
    const addOfflineCaptionFile = (caption) => offlineCaptionFiles.value.push(caption);

    const latestVideoTime = ref(0);
    const setLatestVideoTime = (time) => (latestVideoTime.value = time);

    const $reset = () => {
        if (!shouldReset.value) {
            shouldReset.value = true;
            return;
        }

        videoPath.value = null;
        offlineCaptionFiles.value = [];
        latestVideoTime.value = 0;
        shouldReset.value = true;
    };

    return { videoPath, setVideoPath, offlineCaptionFiles, addOfflineCaptionFile, latestVideoTime, setLatestVideoTime, $reset };
});
