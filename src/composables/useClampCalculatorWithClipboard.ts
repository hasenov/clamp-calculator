import type { ClampConfig } from '@/types'
import { useClampCalculator } from './useClampCalculator'
import { useClipboard } from './useClipboard'

export function useClampCalculatorWithClipboard(config: ClampConfig) {
    const calculator = useClampCalculator(config)
    const clipboard = useClipboard()

    const copyToClipboard = async () => {
        if (!calculator.hasErrors.value) {
            await clipboard.copy(calculator.clampResult.value)
        }
    }

    return {
        ...calculator,
        copyToClipboard,
        copySuccess: clipboard.copySuccess,
        copyError: clipboard.copyError,
        isLoading: clipboard.isLoading,
        parseClampFunction: calculator.parseClampFunction,
    }
}
