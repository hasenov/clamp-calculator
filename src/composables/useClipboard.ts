import { computed, ref } from 'vue'
import { ClipboardService } from '../services/clipboard.service'

export function useClipboard() {
    const isSupported = computed(() => ClipboardService.isClipboardAvailable())
    const copySuccess = ref(false)
    const copyError = ref<string | null>(null)
    const isLoading = ref(false)

    const copy = async (text: string): Promise<boolean> => {
        if (!text.trim()) {
            copyError.value = 'Nothing to copy'
            copySuccess.value = false
            return false
        }

        isLoading.value = true
        copyError.value = null

        try {
            const success = await ClipboardService.copyToClipboard(text)

            if (success) {
                copySuccess.value = true
                setTimeout(() => {
                    copySuccess.value = false
                }, 2000)
            } else {
                copyError.value = 'Failed to copy to clipboard'
            }

            return success
        } catch (error) {
            copyError.value = 'Copy operation failed'
            return false
        } finally {
            isLoading.value = false
        }
    }

    const reset = () => {
        copySuccess.value = false
        copyError.value = null
        isLoading.value = false
    }

    return {
        isSupported,
        copySuccess: computed(() => copySuccess.value),
        copyError: computed(() => copyError.value),
        isLoading: computed(() => isLoading.value),
        copy,
        reset,
    }
}
