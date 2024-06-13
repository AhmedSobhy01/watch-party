<script setup>
import { useUserStore } from "@/stores/user";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const errorMessage = ref("");

const router = useRouter();
const userStore = useUserStore();

const form = ref({
    username: "",
    roomCode: "",
    roomName: "",
    roomType: "online",
    files: [
        {
            type: "",
            url: "",
            label: "",
        },
    ],
    videoLength: 0,
});

const addFile = () => {
    form.value.files.push({
        type: "",
        url: "",
        label: "",
    });
};

const removeFile = (index) => {
    form.value.files.splice(index, 1);
};

// Offline file
const videoFile = ref(null);
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

// Form handler
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
        data.files = form.value.files;
    } else {
        data.files = [
            {
                type: "video",
                length: form.value.videoLength > 0 ? form.value.videoLength : 0,
            },
        ];
    }

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
            router.push(`/room/${form.value.roomCode.replace(/\s/g, "")}`);
        })
        .catch((_) => (errorMessage.value = "An error occurred. Please try again."));
};

onMounted(() => {
    videoFile.value.addEventListener("change", getVideoLength);
});
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
                <button type="button" class="absolute -top-3 -right-3 p-1 bg-red-600 rounded-full h-5 w-5 text-sm flex items-center justify-center" @click="removeFile(index)" v-if="form.files.length > 1">
                    <FontAwesomeIcon :icon="faXmark" />
                </button>

                <select class="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 bg-zinc-800 text-white" v-model="form.files[index].type">
                    <option value="" disabled>Select Source Type</option>
                    <option value="video">Video</option>
                    <option value="caption">Caption</option>
                </select>
                <input class="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 bg-zinc-800 text-white" type="text" placeholder="Source Label" autocomplete="off" v-model="form.files[index].label" />
                <input class="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 bg-zinc-800 text-white" type="text" placeholder="Source URL" autocomplete="off" v-model="form.files[index].url" />
            </div>

            <button type="button" class="bg-white text-black px-4 py-1.5 rounded-lg text-lg font-medium hover:bg-gray-100 transition-all ease-in-out duration-100 w-full" @click="addFile">Add File</button>
        </div>

        <div class="border p-5 flex flex-col gap-4" v-show="form.roomType == 'offline'">
            <input type="file" class="w-full" accept="video/*" @change="getVideoLength" ref="videoFile" />
        </div>

        <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>

        <button type="submit" class="bg-white text-black px-4 py-1.5 rounded-lg text-lg font-medium hover:bg-gray-100 transition-all ease-in-out duration-100">Create</button>
    </form>
</template>
