<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseFormSection from './BaseFormSection.vue'
import ImportExport from './ImportExport.vue'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import type { Project, PresetConfig } from '../types/project.types'

// Props
interface Props {
    projects: Project[]
    currentProject: Project | null
    currentPreset: PresetConfig | null
    currentProjectPresets: PresetConfig[]
    projectOptions: Array<{ label: string; value: string }>
    presetOptions: Array<{ label: string; value: string }>
    currentProjectId: string | null
    currentPresetId: string | null
    hasProjects: boolean
    hasCurrentProject: boolean
    hasCurrentPreset: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
    'project:create': [projectName: string]
    'project:select': [projectId: string | null]
    'project:update': [projectId: string, updates: { name: string }]
    'project:delete': [projectId: string]
    'preset:create': [presetName: string]
    'preset:select': [presetId: string | null]
    'preset:update': [presetId: string, updates: { name: string }]
    'preset:delete': [presetId: string]
    'import:projects': [projects: Project[]]
}>()

// Local state
const showProjectDialog = ref(false)
const showPresetDialog = ref(false)
const showEditProjectDialog = ref(false)
const showEditPresetDialog = ref(false)
const newProjectName = ref('')
const newPresetName = ref('')
const editProjectName = ref('')
const editPresetName = ref('')
const editingProjectId = ref<string | null>(null)
const editingPresetId = ref<string | null>(null)

const confirm = useConfirm()

// Computed
const selectedProjectValue = computed({
    get: () => props.currentProjectId,
    set: (value: string | null) => emit('project:select', value),
})

const selectedPresetValue = computed({
    get: () => props.currentPresetId,
    set: (value: string | null) => emit('preset:select', value),
})

// Project methods
const createProject = () => {
    newProjectName.value = ''
    showProjectDialog.value = true
}

const saveProject = async () => {
    if (!newProjectName.value.trim()) return

    try {
        emit('project:create', newProjectName.value.trim())
        showProjectDialog.value = false
        newProjectName.value = ''
    } catch (error) {
        // Error handled in App.vue
    }
}

const editProject = () => {
    if (!props.currentProject) return

    editingProjectId.value = props.currentProject.id
    editProjectName.value = props.currentProject.name
    showEditProjectDialog.value = true
}

const saveProjectEdit = async () => {
    if (!editingProjectId.value || !editProjectName.value.trim()) return

    try {
        emit('project:update', editingProjectId.value, { name: editProjectName.value.trim() })
        showEditProjectDialog.value = false
        editingProjectId.value = null
        editProjectName.value = ''
    } catch (error) {
        // Error handled in App.vue
    }
}

const deleteProject = () => {
    if (!props.currentProject) return

    confirm.require({
        message: `Are you sure you want to delete project "${props.currentProject.name}"? This will also delete all its presets.`,
        header: 'Delete Project',
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-secondary p-button-outlined',
        rejectLabel: 'Cancel',
        acceptLabel: 'Delete',
        acceptClass: 'p-button-danger',
        accept: () => {
            try {
                emit('project:delete', props.currentProject!.id)
            } catch (error) {
                // Error handled in App.vue
            }
        },
    })
}

// Preset methods
const createPreset = () => {
    newPresetName.value = ''
    showPresetDialog.value = true
}

const savePreset = async () => {
    if (!newPresetName.value.trim()) return

    try {
        emit('preset:create', newPresetName.value.trim())
        showPresetDialog.value = false
        newPresetName.value = ''
    } catch (error) {
        // Error handled in App.vue
    }
}

const editPreset = () => {
    if (!props.currentPreset) return

    editingPresetId.value = props.currentPreset.id
    editPresetName.value = props.currentPreset.name
    showEditPresetDialog.value = true
}

const savePresetEdit = async () => {
    if (!editingPresetId.value || !editPresetName.value.trim()) return

    try {
        emit('preset:update', editingPresetId.value, { name: editPresetName.value.trim() })
        showEditPresetDialog.value = false
        editingPresetId.value = null
        editPresetName.value = ''
    } catch (error) {
        // Error handled in App.vue
    }
}

const deletePreset = () => {
    if (!props.currentPreset) return

    confirm.require({
        message: `Are you sure you want to delete preset "${props.currentPreset.name}"?`,
        header: 'Delete Preset',
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-secondary p-button-outlined',
        rejectLabel: 'Cancel',
        acceptLabel: 'Delete',
        acceptClass: 'p-button-danger',
        accept: () => {
            try {
                emit('preset:delete', props.currentPreset!.id)
            } catch (error) {
                // Error handled in App.vue
            }
        },
    })
}

const handleImportProjects = (projects: Project[]) => {
    emit('import:projects', projects)
}
</script>

<template>
    <BaseFormSection title="Project Management" icon="🎯">
        <div class="project-manager">
            <ImportExport
                :currentProject="currentProject"
                :allProjects="projects"
                @import:projects="handleImportProjects"
            />

            <!-- Project Selection Row -->
            <div class="manager-row">
                <div class="field-group">
                    <div class="form-label">Project</div>
                    <div class="field-controls">
                        <Select
                            v-model="selectedProjectValue"
                            :options="projectOptions"
                            option-label="label"
                            option-value="value"
                            placeholder="Select Project"
                            class="select-field"
                            :show-clear="true"
                        />
                        <Button
                            icon="pi pi-plus"
                            class="p-button-outlined"
                            @click="createProject"
                            v-tooltip="'Create New Project'"
                        />
                        <Button
                            icon="pi pi-pencil"
                            class="p-button-outlined"
                            @click="editProject"
                            :disabled="!hasCurrentProject"
                            v-tooltip="'Edit Project'"
                        />
                        <Button
                            icon="pi pi-trash"
                            class="p-button-outlined p-button-danger"
                            @click="deleteProject"
                            :disabled="!hasCurrentProject"
                            v-tooltip="'Delete Project'"
                        />
                    </div>
                </div>
            </div>

            <!-- Preset Selection Row -->
            <div class="manager-row">
                <div class="field-group">
                    <div class="form-label">
                        Preset
                        <span v-if="hasCurrentPreset" class="auto-save-indicator">
                            <i class="pi pi-save" style="font-size: 0.8rem; color: #10b981"></i>
                            Auto-saving
                        </span>
                    </div>
                    <div class="field-controls">
                        <Select
                            v-model="selectedPresetValue"
                            :options="presetOptions"
                            option-label="label"
                            option-value="value"
                            placeholder="Select Preset"
                            class="select-field"
                            :disabled="!hasCurrentProject"
                            :show-clear="true"
                        />
                        <Button
                            icon="pi pi-plus"
                            class="p-button-outlined"
                            @click="createPreset"
                            :disabled="!hasCurrentProject"
                            v-tooltip="'Create New Preset'"
                        />
                        <Button
                            icon="pi pi-pencil"
                            class="p-button-outlined"
                            @click="editPreset"
                            :disabled="!hasCurrentPreset"
                            v-tooltip="'Edit Preset'"
                        />
                        <Button
                            icon="pi pi-trash"
                            class="p-button-outlined p-button-danger"
                            @click="deletePreset"
                            :disabled="!hasCurrentPreset"
                            v-tooltip="'Delete Preset'"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Create Project Dialog -->
        <Dialog
            v-model:visible="showProjectDialog"
            modal
            header="Create New Project"
            :style="{ width: '400px' }"
            class="project-dialog"
        >
            <div class="dialog-content">
                <div class="field">
                    <label for="project-name" class="dialog-label">Project Name</label>
                    <InputText
                        id="project-name"
                        v-model="newProjectName"
                        placeholder="Enter project name"
                        class="w-full"
                        autofocus
                        @keyup.enter="saveProject"
                    />
                </div>
                <div class="info-text">
                    Two default presets (Base and Custom) will be created automatically.
                </div>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <Button
                        label="Cancel"
                        class="p-button-text"
                        @click="showProjectDialog = false"
                    />
                    <Button
                        label="Create"
                        @click="saveProject"
                        :disabled="!newProjectName.trim()"
                    />
                </div>
            </template>
        </Dialog>

        <!-- Edit Project Dialog -->
        <Dialog
            v-model:visible="showEditProjectDialog"
            modal
            header="Edit Project"
            :style="{ width: '400px' }"
            class="project-dialog"
        >
            <div class="dialog-content">
                <div class="field">
                    <label for="edit-project-name" class="dialog-label">Project Name</label>
                    <InputText
                        id="edit-project-name"
                        v-model="editProjectName"
                        placeholder="Enter project name"
                        class="w-full"
                        autofocus
                        @keyup.enter="saveProjectEdit"
                    />
                </div>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <Button
                        label="Cancel"
                        class="p-button-text"
                        @click="showEditProjectDialog = false"
                    />
                    <Button
                        label="Save"
                        @click="saveProjectEdit"
                        :disabled="!editProjectName.trim()"
                    />
                </div>
            </template>
        </Dialog>

        <!-- Create/Save Preset Dialog -->
        <Dialog
            v-model:visible="showPresetDialog"
            modal
            header="Create Preset"
            :style="{ width: '400px' }"
            class="project-dialog"
        >
            <div class="dialog-content">
                <div class="field">
                    <label for="preset-name" class="dialog-label">Preset Name</label>
                    <InputText
                        id="preset-name"
                        v-model="newPresetName"
                        placeholder="Enter preset name"
                        class="w-full"
                        autofocus
                        @keyup.enter="savePreset"
                    />
                </div>
                <div class="info-text">
                    <small
                        >This preset will save your current viewport settings and unit
                        preferences.</small
                    >
                </div>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <Button
                        label="Cancel"
                        class="p-button-text"
                        @click="showPresetDialog = false"
                    />
                    <Button label="Save" @click="savePreset" :disabled="!newPresetName.trim()" />
                </div>
            </template>
        </Dialog>

        <!-- Edit Preset Dialog -->
        <Dialog
            v-model:visible="showEditPresetDialog"
            modal
            header="Edit Preset"
            :style="{ width: '400px' }"
            class="project-dialog"
        >
            <div class="dialog-content">
                <div class="field">
                    <label for="edit-preset-name" class="dialog-label">Preset Name</label>
                    <InputText
                        id="edit-preset-name"
                        v-model="editPresetName"
                        placeholder="Enter preset name"
                        class="w-full"
                        autofocus
                        @keyup.enter="savePresetEdit"
                    />
                </div>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <Button
                        label="Cancel"
                        class="p-button-text"
                        @click="showEditPresetDialog = false"
                    />
                    <Button
                        label="Save"
                        @click="savePresetEdit"
                        :disabled="!editPresetName.trim()"
                    />
                </div>
            </template>
        </Dialog>

        <!-- Confirm Dialog -->
        <ConfirmDialog />
    </BaseFormSection>
</template>

<style scoped>
.project-manager {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.manager-row {
    display: flex;
    align-items: flex-start;
}

.field-group {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.field-controls {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    flex-wrap: wrap;
}

.select-field {
    flex: 1;
    min-width: 200px;
}

.auto-save-indicator {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 500;
    color: var(--green-600);
    margin-left: 8px;
}

.dialog-content {
    padding: 8px 0;
}

.field {
    margin-bottom: 16px;
}

.dialog-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
}

.info-text {
    font-size: 13px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

/* Responsive */
@media (max-width: 768px) {
    .field-controls {
        flex-direction: column;
        align-items: stretch;
    }

    .select-field {
        min-width: unset;
    }

    .field-controls {
        gap: 12px;
    }
}

@media (max-width: 640px) {
    .project-manager {
        gap: 16px;
    }

    .manager-row {
        flex-direction: column;
    }
}
</style>
