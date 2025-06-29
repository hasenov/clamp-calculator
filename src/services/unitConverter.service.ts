import { CSSUnit, RootFontSize, ClampCalculationError } from '../types/clamp.types'

export class UnitConverterService {
    private static readonly FONT_SIZE_MAP = {
        [RootFontSize.STANDARD]: 16,
        [RootFontSize.SIMPLIFIED]: 10,
    }

    static getBaseFontSize(rootFontSize: RootFontSize): number {
        return this.FONT_SIZE_MAP[rootFontSize]
    }

    static convertPxToRem(pxValue: number, rootFontSize: RootFontSize): number {
        const baseFontSize = this.getBaseFontSize(rootFontSize)
        return pxValue / baseFontSize
    }

    static convertToPixels(value: number, unit: CSSUnit, baseFontSize: number): number {
        if (!isFinite(value) || !isFinite(baseFontSize)) {
            throw new ClampCalculationError('Invalid numeric values', 'INVALID_NUMBER')
        }

        switch (unit) {
            case CSSUnit.REM:
            case CSSUnit.EM:
                return value * baseFontSize
            case CSSUnit.PX:
                return value
            default:
                throw new ClampCalculationError(`Unsupported unit: ${unit}`, 'UNSUPPORTED_UNIT')
        }
    }
}
