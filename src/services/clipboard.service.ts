import { LoggerService } from './logger.service'

export class ClipboardService {
    /**
     * Copy text to clipboard with fallback for older browsers
     */
    static async copyToClipboard(text: string): Promise<boolean> {
        try {
            LoggerService.debug('Attempting to copy to clipboard', 'Clipboard', {
                textLength: text.length,
            })

            // Modern clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text)
                LoggerService.info('Text copied successfully using modern API', 'Clipboard')
                return true
            }

            LoggerService.debug('Modern clipboard API not available, using fallback', 'Clipboard')
            // Fallback for older browsers
            return this.fallbackCopyToClipboard(text)
        } catch (error) {
            LoggerService.error('Failed to copy to clipboard', 'Clipboard', error)
            return this.fallbackCopyToClipboard(text)
        }
    }

    /**
     * Fallback method for copying text to clipboard
     */
    private static fallbackCopyToClipboard(text: string): boolean {
        try {
            LoggerService.debug('Using fallback clipboard method', 'Clipboard')

            const textArea = document.createElement('textarea')
            textArea.value = text
            textArea.style.position = 'fixed'
            textArea.style.left = '-999999px'
            textArea.style.top = '-999999px'

            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()

            const successful = document.execCommand('copy')
            document.body.removeChild(textArea)

            if (successful) {
                LoggerService.info('Text copied successfully using fallback method', 'Clipboard')
            } else {
                LoggerService.warn('Fallback copy command failed', 'Clipboard')
            }

            return successful
        } catch (error) {
            LoggerService.error('Fallback copy failed', 'Clipboard', error)
            return false
        }
    }

    /**
     * Check if clipboard API is available
     */
    static isClipboardAvailable(): boolean {
        const available = !!(navigator.clipboard && window.isSecureContext)
        LoggerService.debug('Clipboard availability check', 'Clipboard', { available })
        return available
    }
}
