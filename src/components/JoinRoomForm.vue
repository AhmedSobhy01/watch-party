<script setup>
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import { useRouter } from "vue-router";

const errorMessage = ref("");

const router = useRouter();
const userStore = useUserStore();

const form = ref({
    username: "",
    roomCode: "",
});

const joinRoom = () => {
    errorMessage.value = "";

    if (!form.value.username || !form.value.roomCode) {
        errorMessage.value = "Please fill in all fields.";
        return;
    }

    userStore.setUsername(form.value.username);

    router.push(`/room/${form.value.roomCode}`);
};
</script>

<template>
    <form class="mt-10 flex flex-col items-stretch justify-center gap-4 w-full" @submit.prevent="joinRoom">
        <input class="px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 bg-zinc-800 text-white" type="text" name="username" placeholder="Username" autocomplete="off" required v-model="form.username" />
        <input class="px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 bg-zinc-800 text-white" type="text" name="roomCode" placeholder="Room Code" autocomplete="off" required v-model="form.roomCode" />

        <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>

        <button type="submit" class="bg-white text-black px-4 py-1.5 rounded-lg text-lg font-medium hover:bg-gray-100 transition-all ease-in-out duration-100">Join</button>
    </form>
</template>
