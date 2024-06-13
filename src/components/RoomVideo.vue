<script setup>
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useSocketStore } from "@/stores/socket";
import { useVideoStore } from "@/stores/video";

const props = defineProps({
    roomType: {
        type: String,
    },
    roomCode: {
        type: String,
    },
    files: {
        type: Array,
    },
});

const emit = defineEmits(["appendMessage", "reloadComponent"]);

const socketStore = useSocketStore();
const videoStore = useVideoStore();

// Files
const videoFiles = computed(() => props.files.filter((file) => file.type == "video"));
const captionsFiles = computed(() => props.files.filter((file) => file.type == "caption"));

// Video player
const playerElement = ref(null);
const player = ref(null);
const currentVideoStats = ref({
    currentTime: 0,
    isPlaying: false,
    allowEmit: true,
});

// Update player
const updatePlayer = () => {
    player.value.currentTime = currentVideoStats.value.currentTime;

    if (currentVideoStats.value.isPlaying) player.value.play();
    else player.value.pause();
};

// Video action message generator
const messageGenerator = (state, username, context) => {
    const totalSeconds = Math.round(context);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const padTime = (timeUnit) => timeUnit.toString().padStart(2, "0");

    const formattedHours = padTime(hours);
    const formattedMinutes = padTime(minutes);
    const formattedSeconds = padTime(seconds);

    const timeString = hours > 0 ? `${formattedHours}:${formattedMinutes}:${formattedSeconds}` : `${formattedMinutes}:${formattedSeconds}`;

    return `${username} ${state} the video at ${timeString}`;
};

// Bind and unbind socket events
const bindEvents = () => {
    socketStore.socket.on("player-update", (data) => {
        if (data.message == "play") {
            currentVideoStats.value.isPlaying = true;
            currentVideoStats.value.currentTime = data.context;
            currentVideoStats.value.allowEmit = false;

            updatePlayer();

            emit("appendMessage", {
                username: "System",
                text: messageGenerator("played", data.username, data.context),
            });
        }

        if (data.message == "pause") {
            currentVideoStats.value.isPlaying = false;
            currentVideoStats.value.currentTime = data.context;
            currentVideoStats.value.allowEmit = false;

            updatePlayer();

            emit("appendMessage", {
                username: "System",
                text: messageGenerator("paused", data.username, data.context),
            });
        }
    });
};

const unbindEvents = () => {
    socketStore.socket.off("player-update");
};

// Video player controls handler listener
const videoControlsHandler = (e) => {
    if (e.type == "play") {
        if (currentVideoStats.value.allowEmit == true) {
            socketStore.socket.emit("player-control", { message: "play", context: player.value.currentTime, roomCode: props.roomCode });

            currentVideoStats.value.isPlaying = true;

            emit("appendMessage", {
                username: "System",
                text: messageGenerator("played", "You", player.value.currentTime),
            });
        }

        setTimeout(() => (currentVideoStats.value.allowEmit = true), 500);
    } else if (e.type == "pause") {
        if (currentVideoStats.value.allowEmit == true) {
            socketStore.socket.emit("player-control", { message: "pause", context: player.value.currentTime, roomCode: props.roomCode });

            currentVideoStats.value.isPlaying = false;

            emit("appendMessage", {
                username: "System",
                text: messageGenerator("paused", "You", player.value.currentTime),
            });
        }

        setTimeout(() => (currentVideoStats.value.allowEmit = true), 500);
    }
};

const updateVideoStats = () => (currentVideoStats.value.currentTime = player.value.currentTime);

const addPlayerListeners = () => {
    playerElement.value.addEventListener("play", videoControlsHandler, false);
    playerElement.value.addEventListener("pause", videoControlsHandler, false);
    playerElement.value.addEventListener("loadedmetadata", updateVideoStats, false);
};

const removePlayerListeners = () => {
    if (!playerElement.value) return;

    playerElement.value.removeEventListener("play", videoControlsHandler, false);
    playerElement.value.removeEventListener("pause", videoControlsHandler, false);
    playerElement.value.removeEventListener("loadedmetadata", updateVideoStats, false);
};

// Add offline video caption via upload
const captionUploadElement = ref(null);
const addCaption = async () => {
    const file = captionUploadElement.value.files[0];

    if (!file) return;

    const label = file.name.split(".")[0];

    // Add caption to the video store
    videoStore.addOfflineCaptionFile({ url: URL.createObjectURL(file), label });

    // Save last time
    videoStore.setLatestVideoTime(player.value.currentTime);

    // Reload component
    emit("reloadComponent");
};

onMounted(() => {
    player.value = new Plyr(playerElement.value);

    bindEvents();

    addPlayerListeners();

    // Play at last registered time at first load
    player.value.on("loadeddata", () => (player.value.currentTime = videoStore.latestVideoTime));
});

onBeforeUnmount(() => {
    unbindEvents();
    removePlayerListeners();
});
</script>

<template>
    <div class="relative h-full">
        <video playsinline controls class="w-full h-full" ref="playerElement">
            <template v-if="roomType == 'online'">
                <source v-for="file in videoFiles" :key="file.url" :src="file.url" :type="file?.mime ?? 'video/mp4'" />

                <track v-for="file in captionsFiles" :key="file.url" :src="file.url" :srclang="file.label.slice(0, 2).toLowerCase()" :label="file.label" />
            </template>

            <template v-else>
                <source :src="videoStore.videoPath" type="video/mp4" />
            </template>

            <track v-for="file in videoStore.offlineCaptionFiles" :key="file.url" :src="file.url" :srclang="file.label.slice(0, 2).toLowerCase()" :label="file.label" />
        </video>

        <input type="file" class="hidden" accept="text/vtt" ref="captionUploadElement" @change="addCaption" />
        <button type="button" class="absolute top-3 right-3 px-4 bg-white text-black rounded-lg hover:bg-gray-100 transition-all ease-in-out duration-100" @click="captionUploadElement.click()" v-if="!currentVideoStats.isPlaying">Add Subtitle</button>
    </div>
</template>
