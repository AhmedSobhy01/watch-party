<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faXmark, faVideo, faClosedCaptioning } from "@fortawesome/free-solid-svg-icons";
import { useVideoStore } from "@/stores/video";

const errorMessage = ref("");

const router = useRouter();
const userStore = useUserStore();
const videoStore = useVideoStore();

const form = ref({
    username: "",
    roomCode: "",
    roomName: "",
    roomType: "online",
    files: [
        {
            type: "video",
            url: "",
        },
    ],
    videoLength: 0,
});

const addCaption = () => {
    form.value.files.push({
        type: "caption",
        url: "",
        label: "",
    });
};

const removeCaption = (index) => {
    // Check if video file is being removed
    if (form.value.files[index].type == "video") return;

    form.value.files.splice(index, 1);
};

// Offline file
const videoFile = ref(null);

const validateVideoFile = () => {
    if (form.value.roomType == "offline") {
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
    }

    return false;
};

const getVideoLength = () => {
    const file = videoFile.value.files[0];

    if (!file) {
        form.value.videoLength = 0;
        return;
    }

    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => (form.value.videoLength = Math.round(video.duration));
};

const onChangeVideoFileHandler = () => {
    if (validateVideoFile()) getVideoLength();
};

// Form handler
const isLoading = ref(false);
const createRoom = () => {
    errorMessage.value = "";

    if (!form.value.username || !form.value.roomCode || !form.value.roomName) {
        errorMessage.value = "Please fill in all fields.";
        return;
    }

    let data = {
        username: form.value.username,
        roomCode: form.value.roomCode,
        roomName: form.value.roomName,
        roomType: form.value.roomType,
        files: [],
    };

    if (form.value.roomType == "online") {
        data.files = form.value.files.filter((file) => file.url || file.label);
    } else {
        if (!validateVideoFile()) return;

        data.files = [
            {
                type: "video",
                length: form.value.videoLength > 0 ? form.value.videoLength : 0,
            },
        ];
    }

    isLoading.value = true;

    // Fetch API to create a room
    fetch(`${import.meta.env.VITE_API_URL}/room/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.message !== "success") {
                errorMessage.value = data.message;
                return;
            }

            userStore.setUsername(form.value.username);

            if (form.value.roomType == "offline") videoStore.setVideoPath(URL.createObjectURL(videoFile.value.files[0]));

            router.push(`/room/${form.value.roomCode.replace(/\s/g, "")}`);
        })
        .catch((_) => (errorMessage.value = "An error occurred. Please try again."))
        .finally(() => (isLoading.value = false));
};
</script>

<template>
    <form class="mt-10 flex flex-col items-stretch justify-center gap-4 w-full" @submit.prevent="createRoom">
        <input class="px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 bg-zinc-800 text-white" type="text" name="username" placeholder="Username" autocomplete="off" required v-model="form.username" />
        <input class="px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 bg-zinc-800 text-white" type="text" name="roomName" placeholder="Room Name" autocomplete="off" required v-model="form.roomName" />
        <input class="px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 bg-zinc-800 text-white" type="text" name="roomCode" placeholder="Room Code" autocomplete="off" required v-model="form.roomCode" />

        <div class="grid grid-cols-2 gap-2 rounded-xl p-2 border border-gray-600">
            <div>
                <input type="radio" name="type" value="online" id="1" class="peer hidden" v-model="form.roomType" />
                <label for="1" class="block cursor-pointer select-none rounded-xl p-2 text-center peer-checked:bg-blue-500 peer-checked:font-bold peer-checked:text-white">Online</label>
            </div>

            <div>
                <input type="radio" name="type" value="offline" id="2" class="peer hidden" v-model="form.roomType" />
                <label for="2" class="block cursor-pointer select-none rounded-xl p-2 text-center peer-checked:bg-blue-500 peer-checked:font-bold peer-checked:text-white">Offline</label>
            </div>
        </div>

        <div class="border p-5 flex flex-col gap-4" v-show="form.roomType == 'online'">
            <div class="p-4 flex items-center gap-3 flex-col border border-dashed border-stone-100 relative" v-for="(file, index) in form.files" :key="index">
                <button type="button" class="absolute -top-3 -right-3 p-1 bg-red-600 rounded-full h-5 w-5 text-sm flex items-center justify-center" @click="removeCaption(index)" v-if="form.files[index].type == 'caption'">
                    <FontAwesomeIcon :icon="faXmark" />
                </button>

                <div class="rounded-lg px-4 bg-orange-600 text-white p-2 leading-none font-bold flex items-center gap-2" v-if="form.files[index].type == 'video'">
                    <FontAwesomeIcon :icon="faVideo" />
                    <span>Video File</span>
                </div>
                <div class="rounded-lg px-4 bg-blue-600 text-white p-2 leading-none font-bold flex items-center gap-2" v-if="form.files[index].type == 'caption'">
                    <FontAwesomeIcon :icon="faClosedCaptioning" />
                    <span>Caption File {{ form.files.length == 2 ? "" : index }}</span>
                </div>
                <input class="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 bg-zinc-800 text-white" type="text" placeholder="Caption Label" autocomplete="off" v-model="form.files[index].label" v-if="form.files[index].type == 'caption'" />
                <input class="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 bg-zinc-800 text-white" type="text" :placeholder="form.files[index].type == 'video' ? 'Video URL' : 'Caption URL'" autocomplete="off" v-model="form.files[index].url" />
            </div>

            <button type="button" class="bg-white text-black px-4 py-1.5 rounded-lg text-lg font-medium hover:bg-gray-100 transition-all ease-in-out duration-100 w-full" @click="addCaption">Add Caption</button>
        </div>

        <div class="border p-5 flex flex-col gap-4" v-show="form.roomType == 'offline'">
            <input type="file" class="w-full" @change="onChangeVideoFileHandler" ref="videoFile" />
        </div>

        <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>

        <button type="submit" class="bg-white text-black px-4 py-1.5 rounded-lg text-lg font-medium transition-all ease-in-out duration-100 flex justify-center items-center gap-3" :class="{ 'cursor-not-allowed bg-opacity-50': isLoading, 'hover:bg-gray-100': !isLoading }" :disabled="isLoading">
            <div role="status" v-if="isLoading">
                <svg aria-hidden="true" class="inline w-4 h-4 text-gray-200 animate-spin fill-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                </svg>
            </div>
            <span>Create Room</span>
        </button>
    </form>
</template>
