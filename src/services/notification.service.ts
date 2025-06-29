export interface NotificationOptions {
    severity?: 'success' | 'info' | 'warn' | 'error'
    summary?: string
    detail: string
    life?: number
    closable?: boolean
}

// Global notification queue for components to consume
class NotificationQueue {
    private static instance: NotificationQueue
    private listeners: Array<(notification: NotificationOptions) => void> = []

    static getInstance(): NotificationQueue {
        if (!NotificationQueue.instance) {
            NotificationQueue.instance = new NotificationQueue()
        }
        return NotificationQueue.instance
    }

    addListener(listener: (notification: NotificationOptions) => void): void {
        this.listeners.push(listener)
    }

    removeListener(listener: (notification: NotificationOptions) => void): void {
        const index = this.listeners.indexOf(listener)
        if (index > -1) {
            this.listeners.splice(index, 1)
        }
    }

    emit(notification: NotificationOptions): void {
        this.listeners.forEach((listener) => listener(notification))
    }
}

export class NotificationService {
    private static queue = NotificationQueue.getInstance()

    static showSuccess(message: string, summary = 'Success', life = 3000): void {
        this.queue.emit({
            severity: 'success',
            summary,
            detail: message,
            life,
            closable: true,
        })
    }

    static showError(message: string, summary = 'Error', life = 5000): void {
        this.queue.emit({
            severity: 'error',
            summary,
            detail: message,
            life,
            closable: true,
        })
    }

    static showInfo(message: string, summary = 'Info', life = 4000): void {
        this.queue.emit({
            severity: 'info',
            summary,
            detail: message,
            life,
            closable: true,
        })
    }

    static showWarning(message: string, summary = 'Warning', life = 4000): void {
        this.queue.emit({
            severity: 'warn',
            summary,
            detail: message,
            life,
            closable: true,
        })
    }

    static showCustom(options: NotificationOptions): void {
        this.queue.emit({
            severity: options.severity || 'info',
            summary: options.summary || 'Notification',
            detail: options.detail,
            life: options.life || 4000,
            closable: options.closable !== false,
        })
    }

    static addListener(listener: (notification: NotificationOptions) => void): void {
        this.queue.addListener(listener)
    }

    static removeListener(listener: (notification: NotificationOptions) => void): void {
        this.queue.removeListener(listener)
    }
}
