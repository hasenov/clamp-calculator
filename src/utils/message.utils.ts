/**
 * Formats a message by replacing placeholders with provided values
 * @param message - The message template with placeholders like {key}
 * @param values - Object with values to replace placeholders
 * @returns Formatted message
 */
export function formatMessage(message: string, values: Record<string, any> = {}): string {
    return message.replace(/\{(\w+)\}/g, (match, key) => {
        return values[key] !== undefined ? String(values[key]) : match
    })
}

/**
 * Formats an error message with context
 * @param baseMessage - Base error message
 * @param context - Additional context information
 * @returns Formatted error message
 */
export function formatErrorMessage(baseMessage: string, context?: Record<string, any>): string {
    if (!context) return baseMessage

    return formatMessage(baseMessage, context)
}

/**
 * Creates a user-friendly error message
 * @param error - Error object or string
 * @param operation - Operation that failed
 * @returns User-friendly error message
 */
export function createUserFriendlyError(error: Error | string, operation?: string): string {
    const errorMessage = typeof error === 'string' ? error : error.message

    if (operation) {
        return `${operation} failed: ${errorMessage}`
    }

    return errorMessage
}
