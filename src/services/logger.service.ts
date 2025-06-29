export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}

export interface LogEntry {
    level: LogLevel
    message: string
    context?: string
    timestamp: Date
    data?: any
}

export class LoggerService {
    private static readonly LOG_LEVEL = import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.ERROR
    private static readonly MAX_LOG_ENTRIES = 100
    private static logEntries: LogEntry[] = []

    static debug(message: string, context?: string, data?: any): void {
        this.log(LogLevel.DEBUG, message, context, data)
    }

    static info(message: string, context?: string, data?: any): void {
        this.log(LogLevel.INFO, message, context, data)
    }

    static warn(message: string, context?: string, data?: any): void {
        this.log(LogLevel.WARN, message, context, data)
    }

    static error(message: string, context?: string, data?: any): void {
        this.log(LogLevel.ERROR, message, context, data)
    }

    private static log(level: LogLevel, message: string, context?: string, data?: any): void {
        if (level < this.LOG_LEVEL) return

        const entry: LogEntry = {
            level,
            message,
            context,
            timestamp: new Date(),
            data,
        }

        this.logEntries.push(entry)

        // Keep only the last MAX_LOG_ENTRIES entries
        if (this.logEntries.length > this.MAX_LOG_ENTRIES) {
            this.logEntries = this.logEntries.slice(-this.MAX_LOG_ENTRIES)
        }

        // Console output based on level
        const prefix = context ? `[${context}]` : ''
        const timestamp = entry.timestamp.toISOString()

        switch (level) {
            case LogLevel.DEBUG:
                console.debug(`${timestamp} ${prefix} ${message}`, data || '')
                break
            case LogLevel.INFO:
                console.info(`${timestamp} ${prefix} ${message}`, data || '')
                break
            case LogLevel.WARN:
                console.warn(`${timestamp} ${prefix} ${message}`, data || '')
                break
            case LogLevel.ERROR:
                console.error(`${timestamp} ${prefix} ${message}`, data || '')
                break
        }
    }

    static getLogEntries(level?: LogLevel): LogEntry[] {
        if (level !== undefined) {
            return this.logEntries.filter((entry) => entry.level >= level)
        }
        return [...this.logEntries]
    }

    static clearLogs(): void {
        this.logEntries = []
    }

    static exportLogs(): string {
        return JSON.stringify(this.logEntries, null, 2)
    }
}
