<script setup>
import { RouterView } from "vue-router";
import { useSocketStore } from "./stores/socket";
import { onBeforeUnmount, onMounted } from "vue";

const socketStore = useSocketStore();

onMounted(() => socketStore.connect());

onBeforeUnmount(() => socketStore.disconnect());
</script>

<template>
    <main class="bg-zinc-900 text-white h-screen overflow-auto md:overflow-y-hidden font-roboto px-5">
        <div v-if="socketStore.error" class="flex items-center justify-center h-screen">
            <h1 class="text-4xl font-bold">There was an error connecting to the server.</h1>
        </div>

        <div v-else-if="!socketStore.connected" class="flex items-center justify-center h-screen">
            <h1 class="text-4xl font-bold">Connecting...</h1>
        </div>

        <RouterView v-else />
    </main>
</template>
