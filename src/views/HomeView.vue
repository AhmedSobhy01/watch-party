<script setup>
import LogoMain from "@/components/icons/IconMain.vue";

const appName = import.meta.env.VITE_APP_NAME;
</script>

<template>
    <div class="flex flex-col items-center justify-center max-w-sm mx-auto h-screen">
        <div class="flex flex-col items-center gap-5">
            <LogoMain />

            <h1 class="font-bold text-5xl md:text-6xl text-center">{{ appName }}</h1>
        </div>

        <div class="flex flex-col items-stretch gap-3 mt-10 w-full text-center">
            <RouterLink :to="{ name: 'create-room' }" class="block bg-white text-black px-4 py-2.5 rounded-lg text-lg font-medium hover:bg-gray-100 transition-all ease-in-out duration-100">Create Room</RouterLink>
            <RouterLink :to="{ name: 'join-room' }" class="block bg-green-500 text-white px-4 py-2.5 rounded-lg text-lg font-medium hover:bg-green-600 transition-all ease-in-out duration-100">Join Room</RouterLink>
        </div>
    </div>
</template>
