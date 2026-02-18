import { defineStore } from "pinia";
import { ref } from "vue";

export const useChatStore = defineStore("chat", () => {
    const messages = ref([]);
    const logMessages = ref([]);
    const unreadCount = ref(0);
    const isFullScreenChatOpen = ref(false);
    const isChatVisible = ref(false);

    const addMessage = (message, isOwnMessage = false) => {
        messages.value.push(message);

        if (!isOwnMessage && !isChatVisible.value && !isFullScreenChatOpen.value) unreadCount.value++;
    };

    const addLogMessage = (log) => {
        logMessages.value.push(log);
    };

    const clearUnreadCount = () => {
        unreadCount.value = 0;
    };

    const setFullScreenChatOpen = (isOpen) => {
        isFullScreenChatOpen.value = isOpen;
        if (isOpen) clearUnreadCount();
    };

    const setChatVisible = (visible) => {
        isChatVisible.value = visible;
        if (visible) clearUnreadCount();
    };

    return {
        messages,
        logMessages,
        unreadCount,
        isFullScreenChatOpen,
        isChatVisible,
        addMessage,
        addLogMessage,
        clearUnreadCount,
        setFullScreenChatOpen,
        setChatVisible,
    };
});
