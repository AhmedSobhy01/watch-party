<script setup>
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useSocketStore } from "@/stores/socket";
import { useVideoStore } from "@/stores/video";
import { formatTimeFromSeconds } from "@/composables/time";
import RoomVideoEmojis from "@/components/RoomVideoEmojis.vue";
import { throttle } from "lodash";

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
const playerContainerElement = ref(null);
const playerElement = ref(null);
const player = ref(null);
const currentVideoStats = ref({
    currentTime: 0,
    isPlaying: false,
    lastEmitAt: 0,
});
const emitAfter = computed(() => (Date.now() - currentVideoStats.value.lastEmitAt > 500 ? 0 : Date.now() - currentVideoStats.value.lastEmitAt));

// Update player
const updatePlayer = (isPlaying, context) => {
    currentVideoStats.value.isPlaying = isPlaying;
    currentVideoStats.value.currentTime = context;

    player.value.currentTime = currentVideoStats.value.currentTime;

    if (currentVideoStats.value.isPlaying) player.value.play();
    else player.value.pause();
};

// Video action message generator
const messageGenerator = (state, username, context) => `${username} ${state} the video at ${formatTimeFromSeconds(context)}`;

// Bind and unbind socket events
const bindEvents = () => {
    socketStore.socket.on("player-update", (data) => {
        updatePlayer(data.isPlaying, data.context);

        if (data.message == "play") {
            emit("appendMessage", {
                username: "System",
                text: messageGenerator("played", data.username, data.context),
            });
        }

        if (data.message == "pause") {
            emit("appendMessage", {
                username: "System",
                text: messageGenerator("paused", data.username, data.context),
            });
        }

        if (data.message == "seek") {
            emit("appendMessage", {
                username: "System",
                text: messageGenerator("seeked", data.username, data.context),
            });
        }
    });
};

const unbindEvents = () => {
    socketStore.socket.off("player-update");
};

// Video player controls handler listener
const seekingStatus = ref({
    isSeeking: false,
    seekStart: null,
    seekEnd: null,
});

const videoControlsHandler = (e) => {
    if (seekingStatus.value.isSeeking) return;

    if (e.type == "play") {
        currentVideoStats.value.isPlaying = true;

        setTimeout(() => {
            socketStore.socket.emit("player-control", { message: "play", context: player.value.currentTime, roomCode: props.roomCode, isPlaying: true });

            emit("appendMessage", {
                username: "System",
                text: messageGenerator("played", "You", player.value.currentTime),
            });
        }, emitAfter.value);

        currentVideoStats.value.lastEmitAt = Date.now() + emitAfter.value;
    } else if (e.type == "pause") {
        setTimeout(() => {
            currentVideoStats.value.isPlaying = false;

            socketStore.socket.emit("player-control", { message: "pause", context: player.value.currentTime, roomCode: props.roomCode, isPlaying: false });

            emit("appendMessage", {
                username: "System",
                text: messageGenerator("paused", "You", player.value.currentTime),
            });

            currentVideoStats.value.lastEmitAt = Date.now();
        }, emitAfter.value);

        currentVideoStats.value.lastEmitAt = Date.now() + emitAfter.value;
    }
};

// Video seeking handler listener
const videoSeekingHandler = () => {
    if (seekingStatus.value.isSeeking) return;

    seekingStatus.value.isSeeking = true;
    seekingStatus.value.seekStart = Math.floor(currentVideoStats.value.currentTime);
    seekingStatus.value.seekEnd = null;
};

// Video seeked handler listener
const videoSeekedHandler = () => {
    if (!seekingStatus.value.isSeeking) return;

    seekingStatus.value.isSeeking = false;
    seekingStatus.value.seekEnd = Math.floor(player.value.currentTime);

    if (seekingStatus.value.seekStart != seekingStatus.value.seekEnd) {
        setTimeout(() => {
            currentVideoStats.value.currentTime = player.value.currentTime;
            currentVideoStats.value.isPlaying = player.value.playing;

            socketStore.socket.emit("player-control", { message: "seek", context: player.value.currentTime, roomCode: props.roomCode, isPlaying: currentVideoStats.value.isPlaying });

            emit("appendMessage", {
                username: "System",
                text: messageGenerator("seeked", "You", player.value.currentTime),
            });
        }, emitAfter.value);

        currentVideoStats.value.lastEmitAt = Date.now() + emitAfter.value;
    }
};

// Update video stats
const updateVideoStats = () => (currentVideoStats.value.currentTime = player.value.currentTime);

// Add and remove player listeners
const addPlayerListeners = () => {
    playerElement.value.addEventListener("play", videoControlsHandler, false);
    playerElement.value.addEventListener("pause", videoControlsHandler, false);
    playerElement.value.addEventListener("seeking", videoSeekingHandler, false);
    playerElement.value.addEventListener("seeked", videoSeekedHandler, false);
    playerElement.value.addEventListener("loadedmetadata", updateVideoStats, false);
    playerElement.value.addEventListener("playing", updateVideoStats, false);
};

const removePlayerListeners = () => {
    if (!playerElement.value) return;

    playerElement.value.removeEventListener("play", videoControlsHandler, false);
    playerElement.value.removeEventListener("pause", videoControlsHandler, false);
    playerElement.value.removeEventListener("seeking", videoSeekingHandler, false);
    playerElement.value.removeEventListener("seeked", videoSeekedHandler, false);
    playerElement.value.removeEventListener("loadedmetadata", updateVideoStats, false);
    playerElement.value.removeEventListener("playing", updateVideoStats, false);
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
    player.value = new Plyr(playerElement.value, {
        fullscreen: {
            enabled: true,
            fallback: true,
            iosNative: false,
            container: "#player-container",
        },
    });

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
    <div class="relative h-full overflow-hidden" id="player-container" ref="playerContainerElement">
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

        <div class="absolute bottom-3 right-32 z-50">
            <RoomVideoEmojis :playerContainer="playerContainerElement" />
        </div>
    </div>
</template>
