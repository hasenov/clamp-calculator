import { reactive, readonly } from 'vue'
import type { ClampConfig } from '../types/clamp.types'
import { ClampCalculatorService } from '../services/clampCalculator.service'

export function useAppConfig() {
    const config = reactive<ClampConfig>(ClampCalculatorService.getDefaultConfig())

    const resetConfig = () => {
        Object.assign(config, ClampCalculatorService.getDefaultConfig())
    }

    return {
        config: readonly(config),
        resetConfig,
    }
}
