// types/project.types.ts
import type { CSSUnit, RootFontSize } from './clamp.types'

export interface PresetConfig {
    id: string
    name: string
    rootFontSize: RootFontSize
    minDevice: number
    maxDevice: number
    unit: CSSUnit
    convertToRem: boolean
    createdAt: Date
    updatedAt: Date
}

export interface Project {
    id: string
    name: string
    presets: PresetConfig[]
    createdAt: Date
    updatedAt: Date
}

export interface ProjectState {
    projects: Project[]
    currentProjectId: string | null
    currentPresetId: string | null
}

export interface CreateProjectData {
    name: string
}

export interface CreatePresetData {
    projectId: string
    name: string
    config: Omit<PresetConfig, 'id' | 'name' | 'createdAt' | 'updatedAt'>
}
