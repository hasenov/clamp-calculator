<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { NotificationService, type NotificationOptions } from '../services/notification.service'

const toast = useToast()

const handleNotification = (notification: NotificationOptions) => {
    toast.add(notification)
}

onMounted(() => {
    NotificationService.addListener(handleNotification)
})

onUnmounted(() => {
    NotificationService.removeListener(handleNotification)
})
</script>

<template>
    <!-- This component doesn't render anything, it just handles notifications -->
</template>
