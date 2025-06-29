// services/projectManager.service.ts
import type {
    Project,
    PresetConfig,
    ProjectState,
    CreateProjectData,
    CreatePresetData,
} from '../types/project.types'
import { CSSUnit, RootFontSize } from '../types/clamp.types'
import { LoggerService } from './logger.service'

const STORAGE_KEY = 'clamp-calculator-projects'

export class ProjectManagerService {
    private static generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2)
    }

    static getProjectsFromStorage(): ProjectState {
        try {
            LoggerService.debug('Loading projects from storage', 'ProjectManager')
            const stored = localStorage.getItem(STORAGE_KEY)
            if (!stored) {
                LoggerService.info('No stored projects found, using defaults', 'ProjectManager')
                return this.getDefaultProjectState()
            }

            const parsed = JSON.parse(stored)
            parsed.projects = parsed.projects.map((project: any) => ({
                ...project,
                createdAt: new Date(project.createdAt),
                updatedAt: new Date(project.updatedAt),
                presets: project.presets.map((preset: any) => ({
                    ...preset,
                    createdAt: new Date(preset.createdAt),
                    updatedAt: new Date(preset.updatedAt),
                })),
            }))

            LoggerService.info('Projects loaded successfully from storage', 'ProjectManager', {
                projectCount: parsed.projects.length,
            })
            return parsed
        } catch (error) {
            LoggerService.error('Error loading projects from storage', 'ProjectManager', error)
            return this.getDefaultProjectState()
        }
    }

    static saveProjectsToStorage(state: ProjectState): void {
        try {
            LoggerService.debug('Saving projects to storage', 'ProjectManager', {
                projectCount: state.projects.length,
            })
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
            LoggerService.info('Projects saved successfully to storage', 'ProjectManager')
        } catch (error) {
            LoggerService.error('Error saving projects to storage', 'ProjectManager', error)
        }
    }

    static getDefaultProjectState(): ProjectState {
        return {
            projects: [],
            currentProjectId: null,
            currentPresetId: null,
        }
    }

    static createProject(data: CreateProjectData): Project {
        const now = new Date()
        const project: Project = {
            id: this.generateId(),
            name: data.name.trim(),
            presets: [],
            createdAt: now,
            updatedAt: now,
        }

        return project
    }

    static createPreset(data: CreatePresetData): PresetConfig {
        const now = new Date()
        const preset: PresetConfig = {
            id: this.generateId(),
            name: data.name.trim(),
            ...data.config,
            createdAt: now,
            updatedAt: now,
        }

        return preset
    }

    static getDefaultPresetConfig(): Omit<PresetConfig, 'id' | 'name' | 'createdAt' | 'updatedAt'> {
        return {
            rootFontSize: RootFontSize.STANDARD,
            minDevice: 320,
            maxDevice: 1366,
            unit: CSSUnit.REM,
            convertToRem: false,
        }
    }

    static findProjectById(projects: Project[], projectId: string): Project | undefined {
        return projects.find((p) => p.id === projectId)
    }

    static findPresetById(project: Project, presetId: string): PresetConfig | undefined {
        return project.presets.find((p) => p.id === presetId)
    }

    static isProjectNameTaken(projects: Project[], name: string): boolean {
        const trimmedName = name.trim().toLowerCase()
        return projects.some((project) => project.name.toLowerCase() === trimmedName)
    }

    static isPresetNameTaken(project: Project, name: string): boolean {
        const trimmedName = name.trim().toLowerCase()
        return project.presets.some((preset) => preset.name.toLowerCase() === trimmedName)
    }

    static addProjectToState(state: ProjectState, project: Project): ProjectState {
        return {
            ...state,
            projects: [...state.projects, project],
        }
    }

    static updateProjectInState(
        state: ProjectState,
        projectId: string,
        updates: Partial<Project>,
    ): ProjectState {
        return {
            ...state,
            projects: state.projects.map((p) =>
                p.id === projectId
                    ? {
                          ...p,
                          ...updates,
                          name: updates.name ? updates.name.trim() : p.name,
                          updatedAt: new Date(),
                      }
                    : p,
            ),
        }
    }

    static deleteProjectFromState(state: ProjectState, projectId: string): ProjectState {
        const newState = {
            ...state,
            projects: state.projects.filter((p) => p.id !== projectId),
        }

        if (state.currentProjectId === projectId) {
            newState.currentProjectId = null
            newState.currentPresetId = null
        }

        return newState
    }

    static addPresetToProject(
        state: ProjectState,
        projectId: string,
        preset: PresetConfig,
    ): ProjectState {
        return {
            ...state,
            projects: state.projects.map((p) =>
                p.id === projectId
                    ? {
                          ...p,
                          presets: [...p.presets, preset],
                          updatedAt: new Date(),
                      }
                    : p,
            ),
        }
    }

    static updatePresetInProject(
        state: ProjectState,
        projectId: string,
        presetId: string,
        updates: Partial<PresetConfig>,
    ): ProjectState {
        return {
            ...state,
            projects: state.projects.map((p) =>
                p.id === projectId
                    ? {
                          ...p,
                          presets: p.presets.map((preset) =>
                              preset.id === presetId
                                  ? {
                                        ...preset,
                                        ...updates,
                                        name: updates.name ? updates.name.trim() : preset.name,
                                        updatedAt: new Date(),
                                    }
                                  : preset,
                          ),
                          updatedAt: new Date(),
                      }
                    : p,
            ),
        }
    }

    static deletePresetFromProject(
        state: ProjectState,
        projectId: string,
        presetId: string,
    ): ProjectState {
        const newState = {
            ...state,
            projects: state.projects.map((p) =>
                p.id === projectId
                    ? {
                          ...p,
                          presets: p.presets.filter((preset) => preset.id !== presetId),
                          updatedAt: new Date(),
                      }
                    : p,
            ),
        }

        if (state.currentPresetId === presetId) {
            newState.currentPresetId = null
        }

        return newState
    }

    static setCurrentProject(state: ProjectState, projectId: string | null): ProjectState {
        return {
            ...state,
            currentProjectId: projectId,
            currentPresetId: null,
        }
    }

    static setCurrentPreset(state: ProjectState, presetId: string | null): ProjectState {
        return {
            ...state,
            currentPresetId: presetId,
        }
    }
}
