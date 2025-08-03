<script setup lang="ts">
import { reactive } from 'vue'
import ViewportSettings from './components/ViewportSettings.vue'
import DesiredValues from './components/DesiredValues.vue'
import ClampResult from './components/ClampResult.vue'
import AppHeader from './components/AppHeader.vue'
import ProjectManager from './components/ProjectManager.vue'
import NotificationHandler from './components/NotificationHandler.vue'
import { Toast } from 'primevue'
import type { ClampConfig } from './types'
import type { Project } from './types/project.types'
import { useClampCalculatorWithClipboard } from './composables/useClampCalculatorWithClipboard'
import { useProjectManager } from './composables/useProjectManager'
import { ClampCalculatorService } from './services/clampCalculator.service'
import { NotificationService } from './services/notification.service'
import { LoggerService } from './services/logger.service'

const config = reactive<ClampConfig>(ClampCalculatorService.getDefaultConfig())

const {
    errors,
    hasErrors,
    clampResult,
    resetToDefaults: resetCalculatorToDefaults,
    copyToClipboard,
    copySuccess,
    parseClampFunction,
} = useClampCalculatorWithClipboard(config)

const {
    projects,
    currentProject,
    currentPreset,
    currentProjectPresets,
    createProject,
    updateProject,
    deleteProject,
    selectProject,
    createPreset,
    createPresetFromCurrentConfig,
    updatePreset,
    deletePreset,
    selectPreset,
    hasProjects,
    hasCurrentProject,
    hasCurrentPreset,
    getProjectOptions,
    getPresetOptions,
    currentProjectId,
    currentPresetId,
    resetToDefaults: resetProjectsToDefaults,
    importProjects,
} = useProjectManager(config)

const handleReset = () => {
    resetCalculatorToDefaults()
    resetProjectsToDefaults()
    Object.assign(config, ClampCalculatorService.getDefaultConfig())
}

const handleParse = (clampString: string) => {
    parseClampFunction(clampString)
}

const handleError = (error: Error, operation: string) => {
    LoggerService.error(`Error during ${operation}`, 'App', error)
    NotificationService.showError(error.message)
}

const showSuccess = (message: string) => {
    NotificationService.showSuccess(message)
}

const resetConfigToDefaults = () => {
    Object.assign(config, ClampCalculatorService.getDefaultConfig())
}
const handleProjectCreate = async (projectName: string) => {
    try {
        const project = createProject({ name: projectName })
        selectProject(project.id)
        showSuccess('Project created successfully')
    } catch (error) {
        handleError(error as Error, 'project creation')
    }
}

const handleProjectSelect = (projectId: string | null) => {
    selectProject(projectId)
    if (!projectId) {
        resetConfigToDefaults()
    }
}

const handleProjectUpdate = async (projectId: string, updates: { name: string }) => {
    try {
        updateProject(projectId, updates)
        showSuccess('Project updated successfully')
    } catch (error) {
        handleError(error as Error, 'project update')
    }
}

const handleProjectDelete = async (projectId: string) => {
    try {
        deleteProject(projectId)
        resetConfigToDefaults()
        showSuccess('Project deleted successfully')
    } catch (error) {
        handleError(error as Error, 'project deletion')
    }
}

const handlePresetCreate = async (presetName: string) => {
    try {
        if (!currentProject.value) return
        const preset = createPresetFromCurrentConfig(currentProject.value.id, presetName)
        selectPreset(preset.id)
        showSuccess('Preset created successfully')
    } catch (error) {
        handleError(error as Error, 'preset creation')
    }
}

const handlePresetSelect = (presetId: string | null) => {
    selectPreset(presetId)
    if (!presetId) {
        resetConfigToDefaults()
    }
}

const handlePresetUpdate = async (presetId: string, updates: { name: string }) => {
    try {
        if (!currentProject.value) return
        updatePreset(currentProject.value.id, presetId, updates)
        showSuccess('Preset updated successfully')
    } catch (error) {
        handleError(error as Error, 'preset update')
    }
}

const handlePresetDelete = async (presetId: string) => {
    try {
        if (!currentProject.value) return
        deletePreset(currentProject.value.id, presetId)
        resetConfigToDefaults()
        showSuccess('Preset deleted successfully')
    } catch (error) {
        handleError(error as Error, 'preset deletion')
    }
}

const handleImportProjects = (importedProjects: Project[]) => {
    try {
        importProjects(importedProjects)
        showSuccess(
            `Successfully imported ${importedProjects.length} project${importedProjects.length !== 1 ? 's' : ''}`,
        )
    } catch (error) {
        handleError(error as Error, 'project import')
    }
}
</script>

<template>
    <div class="app">
        <NotificationHandler />
        <Toast />
        <div class="container">
            <AppHeader />

            <div class="form-sections">
                <ProjectManager
                    :projects="projects"
                    :currentProject="currentProject"
                    :currentPreset="currentPreset"
                    :currentProjectPresets="currentProjectPresets"
                    :projectOptions="getProjectOptions"
                    :presetOptions="getPresetOptions"
                    :currentProjectId="currentProjectId"
                    :currentPresetId="currentPresetId"
                    :hasProjects="hasProjects"
                    :hasCurrentProject="hasCurrentProject"
                    :hasCurrentPreset="hasCurrentPreset"
                    @project:create="handleProjectCreate"
                    @project:select="handleProjectSelect"
                    @project:update="handleProjectUpdate"
                    @project:delete="handleProjectDelete"
                    @preset:create="handlePresetCreate"
                    @preset:select="handlePresetSelect"
                    @preset:update="handlePresetUpdate"
                    @preset:delete="handlePresetDelete"
                    @import:projects="handleImportProjects"
                />

                <ViewportSettings
                    v-model:rootFontSize="config.rootFontSize"
                    v-model:minDevice="config.minDevice"
                    v-model:maxDevice="config.maxDevice"
                    :errors="errors"
                />

                <DesiredValues
                    v-model:minValue="config.minValue"
                    v-model:maxValue="config.maxValue"
                    v-model:unit="config.unit"
                    v-model:convertToRem="config.convertToRem"
                    :errors="errors"
                />

                <ClampResult
                    :result="clampResult"
                    :hasErrors="hasErrors"
                    :copySuccess="copySuccess"
                    @copy="copyToClipboard"
                    @reset="handleReset"
                    @parse="handleParse"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
.app {
    font-family:
        -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    min-height: 100vh;
    padding: 20px;
    line-height: 1.6;
    position: relative;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
}

.container {
    max-width: 800px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 32px;
    box-shadow:
        0 20px 40px rgba(0, 0, 0, 0.1),
        0 1px 3px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    position: relative;
}

.form-sections {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

@media (max-width: 768px) {
    .app {
        padding: 16px;
    }

    .container {
        margin: 0;
        border-radius: 16px;
        padding: 24px;
    }

    .form-sections {
        gap: 20px;
    }
}

@media (max-width: 640px) {
    .app {
        padding: 8px;
    }

    .container {
        border-radius: 12px;
        padding: 20px;
    }
}

@media (max-width: 480px) {
    .app {
        padding: 0;
    }

    .container {
        border-radius: 0;
        min-height: 100vh;
        padding: 16px;
    }
}
</style>
