<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { throttle } from "lodash";
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import { useSocketStore } from "@/stores/socket";
import { useVideoStore } from "@/stores/video";
import { formatTimeFromSeconds } from "@/composables/time";
import RoomVideoEmojis from "@/components/RoomVideoEmojis.vue";
import Hls from "hls.js";

const props = defineProps({
    roomType: {
        type: String,
    },
    files: {
        type: Array,
    },
});

const emit = defineEmits(["appendMessage", "reloadComponent"]);

const loading = ref(true);

const socketStore = useSocketStore();
const videoStore = useVideoStore();

// Files
const captionsFiles = computed(() => props.files.filter((file) => file.type == "caption"));

// Video player
const playerContainerElement = ref(null);
const playerElement = ref(null);
const player = ref(null);

// Video Player Initialization
const loadM3U8 = (source, options = {}) => {
    const hls = new Hls();
    hls.loadSource(source);

    const updateQuality = (newQuality) => {
        if (newQuality === 0) {
            window.hls.currentLevel = -1; //Enable AUTO quality if option.value = 0
        } else {
            window.hls.levels.forEach((level, levelIndex) => {
                if (level.height === newQuality) window.hls.currentLevel = levelIndex;
            });
        }
    };

    hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
        const availableQualities = hls.levels.map((l) => l.height);
        availableQualities.unshift(0);

        // Add new qualities to option
        options.quality = {
            default: 0, // Default - AUTO
            options: availableQualities,
            forced: true,
            onChange: (e) => updateQuality(e),
        };

        // Add Auto Label
        options.i18n = {
            qualityLabel: {
                0: "Auto",
            },
        };

        hls.on(Hls.Events.LEVEL_SWITCHED, function (event, data) {
            const span = document.querySelector(".plyr__menu__container [data-plyr='quality'][value='0'] span");

            span.innerHTML = hls.autoLevelEnabled ? `AUTO (${hls.levels[data.level].height}p)` : `AUTO`;
        });

        // Initialize new Plyr player with quality options
        player.value = new Plyr(playerElement.value, options);
    });

    hls.attachMedia(playerElement.value);
    window.hls = hls;
};

const initVideoPlayer = async () => {
    // Online video player
    const source = props.files.filter((file) => file.type == "video")[0].url;
    const defaultOptions = {
        fullscreen: {
            enabled: true,
            fallback: true,
            iosNative: false,
            container: "#player-container",
        },
    };

    if (props.roomType == "offline") {
        player.value = new Plyr(playerElement.value, defaultOptions);
    } else if (!Hls.isSupported()) {
        playerElement.value.src = source;
        player.value = new Plyr(playerElement.value, defaultOptions);
    } else {
        if (source.includes(".m3u8")) {
            loadM3U8(source, defaultOptions);
            return;
        }

        await fetch(source, { method: "HEAD" })
            .then((res) => {
                const isOK = /2\d\d/.test("" + res.status);

                const contentType = res.headers.get("content-type").toLowerCase();
                const isM3U8 = contentType === "application/vnd.apple.mpegurl" || contentType === "application/x-mpegURL" || contentType === "video/mp2t";

                if (isOK && isM3U8) loadM3U8(source, defaultOptions);
                else throw new Error("Not a valid m3u8 file");
            })
            .catch((_) => {
                playerElement.value.src = source;
                player.value = new Plyr(playerElement.value, defaultOptions);
            });
    }
};

// Video stats
const currentVideoStats = ref({
    currentTime: 0,
    isPlaying: false,
    lastEmitAt: 0,
});

// Creates a queue for the emit events
// 250 ms delay is for detecting dblclick event when toggling fullscreen
const emitAfter = computed(() => {
    let delay = 250;

    const diff = Date.now() - currentVideoStats.value.lastEmitAt;
    if (diff <= 500) delay += diff > 0 ? diff : 500;

    return delay;
});

// Update player
const updatePlayer = (isPlaying, currentTime) => {
    currentVideoStats.value.isPlaying = isPlaying;
    currentVideoStats.value.currentTime = currentTime;

    player.value.currentTime = currentVideoStats.value.currentTime;

    if (currentVideoStats.value.isPlaying) player.value.play();
    else player.value.pause();
};

// Video action message generator
const messageGenerator = (state, currentTime) => `${state} the video at ${formatTimeFromSeconds(currentTime)}`;

// Bind and unbind socket events
const bindEvents = () => {
    socketStore.socket.on("player-update", (data) => {
        updatePlayer(data.isPlaying, data.currentTime);

        if (data.message == "play") {
            emit("appendMessage", {
                type: "log",
                data: {
                    username: data.username,
                    text: messageGenerator("played", data.currentTime),
                },
            });
        }

        if (data.message == "pause") {
            emit("appendMessage", {
                type: "log",
                data: {
                    username: data.username,
                    text: messageGenerator("paused", data.currentTime),
                },
            });
        }

        if (data.message == "seek") {
            emit("appendMessage", {
                type: "log",
                data: {
                    username: data.username,
                    text: messageGenerator("seeked", data.currentTime),
                },
            });
        }
    });
};

const unbindEvents = () => {
    socketStore.socket.off("player-update");
};

// Video player controls handler listener
const doubleClickStatus = ref({
    wasDoubleClick: false,
    shouldBeToggled: false,
});

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
            // If double click, ignore the event since it's a fullscreen toggle
            if (doubleClickStatus.value.wasDoubleClick) {
                if (doubleClickStatus.value.shouldBeToggled) doubleClickStatus.value.wasDoubleClick = false;
                else doubleClickStatus.value.shouldBeToggled = true;

                return;
            }

            socketStore.socket.emit("player-control", { message: "play", currentTime: player.value.currentTime, isPlaying: true });

            emit("appendMessage", {
                type: "log",
                data: {
                    username: "You",
                    text: messageGenerator("played", player.value.currentTime),
                },
            });
        }, emitAfter.value);

        currentVideoStats.value.lastEmitAt = Date.now() + emitAfter.value;
    } else if (e.type == "pause") {
        setTimeout(() => {
            // If double click, ignore the event since it's a fullscreen toggle
            if (doubleClickStatus.value.wasDoubleClick) {
                if (doubleClickStatus.value.shouldBeToggled) doubleClickStatus.value.wasDoubleClick = false;
                else doubleClickStatus.value.shouldBeToggled = true;

                return;
            }

            currentVideoStats.value.isPlaying = false;

            socketStore.socket.emit("player-control", { message: "pause", currentTime: player.value.currentTime, isPlaying: false });

            emit("appendMessage", {
                type: "log",
                data: {
                    username: "You",
                    text: messageGenerator("paused", player.value.currentTime),
                },
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
const videoSeekedHandler = throttle(() => {
    if (!seekingStatus.value.isSeeking) return;

    seekingStatus.value.isSeeking = false;
    seekingStatus.value.seekEnd = Math.floor(player.value.currentTime);

    if (seekingStatus.value.seekStart != seekingStatus.value.seekEnd) {
        setTimeout(() => {
            currentVideoStats.value.currentTime = player.value.currentTime;
            currentVideoStats.value.isPlaying = player.value.playing;

            socketStore.socket.emit("player-control", { message: "seek", currentTime: player.value.currentTime, isPlaying: currentVideoStats.value.isPlaying });

            emit("appendMessage", {
                type: "log",
                data: {
                    username: "You",
                    text: messageGenerator("seeked", player.value.currentTime),
                },
            });
        }, emitAfter.value);

        currentVideoStats.value.lastEmitAt = Date.now() + emitAfter.value;
    }
}, 750);

// Update video stats
const updateVideoStats = () => (currentVideoStats.value.currentTime = Math.floor(player.value.currentTime));

// Video double click handler
const videoDoubleClickHandler = () => {
    doubleClickStatus.value.wasDoubleClick = true;
    doubleClickStatus.value.shouldBeToggled = false;
};

// Add and remove player listeners
const addPlayerListeners = () => {
    playerElement.value.addEventListener("play", videoControlsHandler, false);
    playerElement.value.addEventListener("pause", videoControlsHandler, false);
    playerElement.value.addEventListener("seeking", videoSeekingHandler, false);
    playerElement.value.addEventListener("seeked", videoSeekedHandler, false);
    playerElement.value.addEventListener("loadedmetadata", updateVideoStats, false);
    playerElement.value.addEventListener("playing", updateVideoStats, false);
    playerContainerElement.value.addEventListener("dblclick", videoDoubleClickHandler, false);
};

const removePlayerListeners = () => {
    if (!playerElement.value) return;

    playerElement.value.removeEventListener("play", videoControlsHandler, false);
    playerElement.value.removeEventListener("pause", videoControlsHandler, false);
    playerElement.value.removeEventListener("seeking", videoSeekingHandler, false);
    playerElement.value.removeEventListener("seeked", videoSeekedHandler, false);
    playerElement.value.removeEventListener("loadedmetadata", updateVideoStats, false);
    playerElement.value.removeEventListener("playing", updateVideoStats, false);
    playerContainerElement.value.removeEventListener("dblclick", videoDoubleClickHandler, false);
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

onMounted(async () => {
    await initVideoPlayer();

    loading.value = false;

    bindEvents();
    addPlayerListeners();
});

onBeforeUnmount(() => {
    unbindEvents();
    removePlayerListeners();
});
</script>

<template>
    <div v-if="loading" class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-90 z-50 flex items-center justify-center">
        <div class="flex items-center flex-col gap-8">
            <div class="loader"></div>
            <p class="text-white text-xl font-bold">Loading...</p>
        </div>
    </div>

    <div class="relative h-full overflow-hidden" id="player-container" ref="playerContainerElement">
        <video playsinline controls class="w-full h-full" ref="playerElement">
            <template v-if="roomType == 'online'">
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

<style scoped>
.loader {
    display: inline-flex;
    gap: 10px;
}
.loader:before,
.loader:after {
    content: "";
    height: 50px;
    aspect-ratio: 1;
    border-radius: 50%;
    background: radial-gradient(farthest-side, #000 95%, #0000) 35% 35%/6px 6px no-repeat #fff;
    transform: scaleX(var(--s, 1)) rotate(0deg);
    animation: l6 1s infinite linear;
}
.loader:after {
    --s: -1;
    animation-delay: -0.1s;
}
@keyframes l6 {
    100% {
        transform: scaleX(var(--s, 1)) rotate(360deg);
    }
}
</style>
