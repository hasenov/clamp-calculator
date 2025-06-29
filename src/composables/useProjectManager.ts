// composables/useProjectManager.ts
import { reactive, computed, watch, nextTick } from 'vue'
import type { ClampConfig } from '../types/clamp.types'
import type {
    Project,
    PresetConfig,
    ProjectState,
    CreateProjectData,
    CreatePresetData,
} from '../types/project.types'
import { ProjectManagerService } from '../services/projectManager.service'
import { ImportExportService } from '../services/importExport.service'
import { LoggerService } from '../services/logger.service'

export function useProjectManager(config: ClampConfig) {
    // Reactive state
    const state = reactive<ProjectState>(ProjectManagerService.getProjectsFromStorage())

    // Flag to prevent infinite loops during config sync
    let isApplyingPreset = false

    // Config synchronization functions (moved before computed to avoid hoisting issues)
    const extractPresetConfigFromClampConfig = (
        clampConfig: ClampConfig,
    ): Omit<PresetConfig, 'id' | 'name' | 'createdAt' | 'updatedAt'> => {
        return {
            rootFontSize: clampConfig.rootFontSize,
            minDevice: clampConfig.minDevice,
            maxDevice: clampConfig.maxDevice,
            unit: clampConfig.unit,
            convertToRem: clampConfig.convertToRem,
        }
    }

    const applyPresetToConfig = async (preset: PresetConfig): Promise<void> => {
        isApplyingPreset = true

        try {
            // Update config with preset values
            config.rootFontSize = preset.rootFontSize
            config.minDevice = preset.minDevice
            config.maxDevice = preset.maxDevice
            config.unit = preset.unit
            config.convertToRem = preset.convertToRem

            // Wait for next tick to ensure all watchers have processed
            await nextTick()
        } finally {
            isApplyingPreset = false
        }
    }

    // Computed getters
    const projects = computed(() => state.projects)
    const currentProject = computed(() => {
        if (!state.currentProjectId) return null
        return ProjectManagerService.findProjectById(state.projects, state.currentProjectId) || null
    })
    const currentPreset = computed(() => {
        if (!currentProject.value || !state.currentPresetId) return null
        return (
            ProjectManagerService.findPresetById(currentProject.value, state.currentPresetId) ||
            null
        )
    })
    const currentProjectPresets = computed(() => currentProject.value?.presets || [])

    // Watch for state changes and save to localStorage
    watch(
        () => state,
        (newState) => {
            ProjectManagerService.saveProjectsToStorage(newState)
        },
        { deep: true },
    )

    // Watch for config changes and auto-save to current preset
    watch(
        () => ({
            rootFontSize: config.rootFontSize,
            minDevice: config.minDevice,
            maxDevice: config.maxDevice,
            unit: config.unit,
            convertToRem: config.convertToRem,
        }),
        (newConfig) => {
            // Only auto-save if we have a current preset and we're not applying a preset
            if (currentPreset.value && !isApplyingPreset && currentProject.value) {
                const presetConfig = extractPresetConfigFromClampConfig(config)
                updatePreset(currentProject.value.id, currentPreset.value.id, presetConfig)
            }
        },
        { deep: true },
    )

    // Watch for preset changes and update config
    watch(
        () => currentPreset.value,
        (preset) => {
            if (preset && !isApplyingPreset) {
                applyPresetToConfig(preset)
            }
        },
        { immediate: true },
    )

    // Project operations
    const createProject = (data: CreateProjectData): Project => {
        // Validate unique name (case-insensitive)
        if (ProjectManagerService.isProjectNameTaken(state.projects, data.name)) {
            throw new Error(`Project with name "${data.name}" already exists`)
        }

        const project = ProjectManagerService.createProject(data)
        Object.assign(state, ProjectManagerService.addProjectToState(state, project))

        // Create default presets
        const basePreset = createPreset({
            projectId: project.id,
            name: 'Base',
            config: ProjectManagerService.getDefaultPresetConfig(),
        })

        const customPreset = createPreset({
            projectId: project.id,
            name: 'Custom',
            config: extractPresetConfigFromClampConfig(config),
        })

        return project
    }

    const updateProject = (projectId: string, updates: Partial<Project>): void => {
        // Validate unique name if name is being updated
        if (updates.name) {
            const existingProject = ProjectManagerService.findProjectById(state.projects, projectId)
            if (
                existingProject &&
                ProjectManagerService.isProjectNameTaken(
                    state.projects.filter((p) => p.id !== projectId),
                    updates.name,
                )
            ) {
                throw new Error(`Project with name "${updates.name}" already exists`)
            }
        }

        Object.assign(state, ProjectManagerService.updateProjectInState(state, projectId, updates))
    }

    const deleteProject = (projectId: string): void => {
        Object.assign(state, ProjectManagerService.deleteProjectFromState(state, projectId))
    }

    const selectProject = (projectId: string | null): void => {
        Object.assign(state, ProjectManagerService.setCurrentProject(state, projectId))
    }

    // Preset operations
    const createPreset = (data: CreatePresetData): PresetConfig => {
        // Validate unique name within project (case-insensitive)
        const project = ProjectManagerService.findProjectById(state.projects, data.projectId)
        if (project && ProjectManagerService.isPresetNameTaken(project, data.name)) {
            throw new Error(`Preset with name "${data.name}" already exists in this project`)
        }

        const preset = ProjectManagerService.createPreset(data)
        Object.assign(
            state,
            ProjectManagerService.addPresetToProject(state, data.projectId, preset),
        )
        return preset
    }

    const createPresetFromCurrentConfig = (projectId: string, name: string): PresetConfig => {
        const presetConfig = extractPresetConfigFromClampConfig(config)
        return createPreset({
            projectId,
            name,
            config: presetConfig,
        })
    }

    const updatePreset = (
        projectId: string,
        presetId: string,
        updates: Partial<PresetConfig>,
    ): void => {
        // Validate unique name if name is being updated
        if (updates.name) {
            const project = ProjectManagerService.findProjectById(state.projects, projectId)
            if (
                project &&
                ProjectManagerService.isPresetNameTaken(
                    { ...project, presets: project.presets.filter((p) => p.id !== presetId) },
                    updates.name,
                )
            ) {
                throw new Error(`Preset with name "${updates.name}" already exists in this project`)
            }
        }

        Object.assign(
            state,
            ProjectManagerService.updatePresetInProject(state, projectId, presetId, updates),
        )
    }

    const deletePreset = (projectId: string, presetId: string): void => {
        Object.assign(
            state,
            ProjectManagerService.deletePresetFromProject(state, projectId, presetId),
        )
    }

    const selectPreset = (presetId: string | null): void => {
        Object.assign(state, ProjectManagerService.setCurrentPreset(state, presetId))
    }

    // Utility functions
    const hasProjects = computed(() => state.projects.length > 0)
    const hasCurrentProject = computed(() => !!currentProject.value)
    const hasCurrentPreset = computed(() => !!currentPreset.value)

    const getProjectOptions = computed(() =>
        state.projects.map((project) => ({
            label: project.name,
            value: project.id,
        })),
    )

    const getPresetOptions = computed(() =>
        currentProjectPresets.value.map((preset) => ({
            label: preset.name,
            value: preset.id,
        })),
    )

    // Reset to defaults (keeping existing functionality)
    const resetToDefaults = (): void => {
        // Clear current selections
        selectProject(null)
        selectPreset(null)
    }

    const importProjects = (importedProjects: Project[]): void => {
        LoggerService.info('Importing projects', 'ProjectManager', {
            importedCount: importedProjects.length,
        })

        // Merge imported projects with existing ones
        const mergedState = ImportExportService.mergeImportedProjects(state, importedProjects)
        Object.assign(state, mergedState)

        LoggerService.info('Projects imported successfully', 'ProjectManager', {
            totalCount: state.projects.length,
        })
    }

    return {
        // State
        projects,
        currentProject,
        currentPreset,
        currentProjectPresets,

        // Project operations
        createProject,
        updateProject,
        deleteProject,
        selectProject,

        // Preset operations
        createPreset,
        createPresetFromCurrentConfig,
        updatePreset,
        deletePreset,
        selectPreset,

        // Config synchronization
        applyPresetToConfig,

        // Computed helpers
        hasProjects,
        hasCurrentProject,
        hasCurrentPreset,
        getProjectOptions,
        getPresetOptions,

        // State getters for dropdowns
        currentProjectId: computed(() => state.currentProjectId),
        currentPresetId: computed(() => state.currentPresetId),

        // Utilities
        resetToDefaults,
        importProjects,
    }
}
