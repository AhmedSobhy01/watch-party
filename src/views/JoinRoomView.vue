<script setup>
import GoBackButton from "@/components/GoBackButton.vue";
import JoinRoomForm from "@/components/JoinRoomForm.vue";
</script>

<template>
    <div class="flex flex-col items-center justify-center max-w-sm mx-auto h-screen">
        <div class="flex flex-col md:flex-row items-center gap-5">
            <GoBackButton />

            <h1 class="text-5xl font-bold text-center">Join Room</h1>
        </div>

        <JoinRoomForm />
    </div>
</template>
