<script setup>
import { useRouter } from "vue-router";

const props = defineProps({
    showText: {
        type: Boolean,
        default: false,
    },
});

const router = useRouter();
const goBack = () => router.go(-1);
</script>

<template>
    <button type="button" @click="goBack" class="flex items-center justify-center text-sm text-gray-600 bg-white rounded-full p-2">
        <svg class="w-7 h-7 rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
        </svg>

        <span class="ml-2 px-3 text-xl font-bold mx-auto" :class="{ 'sm:hidden': !showText }">Go back</span>
    </button>
</template>
