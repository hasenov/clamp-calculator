<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import Dialog from 'primevue/dialog'
import FileUpload from 'primevue/fileupload'
import Message from 'primevue/message'
import { LoggerService } from '../services/logger.service'
import { NotificationService } from '../services/notification.service'
import { ImportExportService, type ImportResult } from '../services/importExport.service'
import type { Project } from '../types/project.types'

// Props
interface Props {
    currentProject: Project | null
    allProjects: Project[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
    'import:projects': [projects: Project[]]
}>()

// State
const menu = ref()
const showImportDialog = ref(false)
const showExportDialog = ref(false)
const importMessage = ref('')
const importMessageType = ref<'success' | 'error' | 'info'>('info')
const selectedFiles = ref<File[]>([])
const importResult = ref<ImportResult | null>(null)

// Menu items
const menuItems = ref([
    {
        label: 'Export',
        icon: 'pi pi-upload',
        items: [
            {
                label: 'Export Current Project',
                icon: 'pi pi-file-export',
                command: () => exportCurrentProject(),
                disabled: !props.currentProject,
            },
            {
                label: 'Export All Projects',
                icon: 'pi pi-copy',
                command: () => exportAllProjects(),
                disabled: props.allProjects.length === 0,
            },
        ],
    },
    {
        label: 'Import',
        icon: 'pi pi-download',
        items: [
            {
                label: 'Import Projects',
                icon: 'pi pi-file-import',
                command: () => openImportDialog(),
            },
        ],
    },
])

// Computed
const canExportCurrent = computed(() => !!props.currentProject)
const canExportAll = computed(() => props.allProjects.length > 0)

// Methods
const toggleMenu = (event: Event) => {
    menu.value.toggle(event)
}

const exportCurrentProject = () => {
    if (!props.currentProject) return

    LoggerService.info('Exporting current project', 'ImportExport')
    const exportData = ImportExportService.exportCurrentProject(props.currentProject)
    downloadJson(exportData, `clamp-project-${props.currentProject.name}.json`)
    showExportDialog.value = true
    NotificationService.showSuccess('Project exported successfully')
}

const exportAllProjects = () => {
    if (props.allProjects.length === 0) return

    LoggerService.info('Exporting all projects', 'ImportExport')
    const exportData = ImportExportService.exportAllProjects(props.allProjects)
    downloadJson(exportData, 'clamp-all-projects.json')
    showExportDialog.value = true
    NotificationService.showSuccess('All projects exported successfully')
}

const openImportDialog = () => {
    showImportDialog.value = true
    importMessage.value = ''
    selectedFiles.value = []
    importResult.value = null
}

const downloadJson = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

const onFileSelect = (event: any) => {
    selectedFiles.value = event.files
    importMessage.value = ''
    importResult.value = null
}

const processImport = async () => {
    if (!selectedFiles.value.length) {
        importMessage.value = 'Please select a file to import'
        importMessageType.value = 'error'
        return
    }

    const file = selectedFiles.value[0]

    try {
        LoggerService.info('Processing import', 'ImportExport', {
            fileName: file.name,
            fileSize: file.size,
        })

        const result = await ImportExportService.importFromFile(file)
        importResult.value = result

        if (result.success) {
            const projectCount = result.importedProjects.length
            const projectText = projectCount === 1 ? 'project' : 'projects'

            importMessage.value = `Successfully imported ${projectCount} ${projectText}`
            importMessageType.value = 'success'

            if (result.warnings.length > 0) {
                importMessage.value += ` (${result.warnings.length} warnings)`
            }

            // Emit imported projects to parent
            emit('import:projects', result.importedProjects)

            NotificationService.showSuccess(
                `Import completed: ${projectCount} ${projectText} imported`,
            )
        } else {
            importMessage.value = `Import failed: ${result.errors.join(', ')}`
            importMessageType.value = 'error'
            NotificationService.showError('Import failed')
        }
    } catch (error) {
        LoggerService.error('Import error', 'ImportExport', error)
        importMessage.value = 'Error: Failed to process import file'
        importMessageType.value = 'error'
        NotificationService.showError('Import failed: Unexpected error')
    }
}

const removeFile = () => {
    selectedFiles.value = []
    importMessage.value = ''
    importResult.value = null
}

const closeImportDialog = () => {
    showImportDialog.value = false
    selectedFiles.value = []
    importMessage.value = ''
    importResult.value = null
}
</script>

<template>
    <div class="import-export">
        <!-- Actions Button -->
        <Button
            icon="pi pi-cog"
            label="Actions"
            class="p-button-outlined actions-button"
            @click="toggleMenu"
            aria-haspopup="true"
            aria-controls="actions-menu"
        />

        <!-- Menu -->
        <Menu ref="menu" id="actions-menu" :model="menuItems" :popup="true" class="actions-menu" />

        <!-- Export Success Dialog -->
        <Dialog
            v-model:visible="showExportDialog"
            modal
            header="Export Successful"
            :style="{ width: '400px' }"
            class="export-dialog"
        >
            <div class="dialog-content">
                <div class="success-icon">
                    <i class="pi pi-check-circle"></i>
                </div>
                <p class="success-message">
                    Your project data has been exported successfully and downloaded to your device.
                </p>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <Button label="Close" @click="showExportDialog = false" autofocus />
                </div>
            </template>
        </Dialog>

        <!-- Import Dialog -->
        <Dialog
            v-model:visible="showImportDialog"
            modal
            header="Import Projects"
            :style="{ width: '500px' }"
            class="import-dialog"
            @hide="closeImportDialog"
        >
            <div class="dialog-content">
                <div class="import-section">
                    <label class="import-label">Select JSON File</label>
                    <FileUpload
                        mode="basic"
                        name="import-file"
                        accept=".json"
                        :max-file-size="10000000"
                        :auto="false"
                        choose-label="Choose File"
                        class="file-upload"
                        @select="onFileSelect"
                    />
                </div>

                <!-- Selected File Info -->
                <div v-if="selectedFiles.length" class="selected-file">
                    <div class="file-info">
                        <i class="pi pi-file"></i>
                        <span class="file-name">{{ selectedFiles[0].name }}</span>
                        <Button
                            icon="pi pi-times"
                            class="p-button-text p-button-sm remove-file-btn"
                            @click="removeFile"
                        />
                    </div>
                </div>

                <!-- Import Message -->
                <Message
                    v-if="importMessage"
                    :severity="importMessageType"
                    :closable="false"
                    class="import-message"
                >
                    {{ importMessage }}
                </Message>

                <div v-if="importResult?.warnings.length" class="import-warnings">
                    <h4 class="warning-title">Warnings</h4>
                    <ul class="warning-list">
                        <li
                            v-for="warning in importResult.warnings"
                            :key="warning"
                            class="warning-item"
                        >
                            {{ warning }}
                        </li>
                    </ul>
                </div>

                <div v-if="importResult?.errors.length" class="import-errors">
                    <h4 class="error-title">Errors</h4>
                    <ul class="error-list">
                        <li v-for="error in importResult.errors" :key="error" class="error-item">
                            {{ error }}
                        </li>
                    </ul>
                </div>

                <!-- Import Info -->
                <div class="import-info">
                    <h4 class="info-title">Supported Formats</h4>
                    <ul class="format-list">
                        <li>Single project export files</li>
                        <li>All projects export files</li>
                        <li>Compatible JSON format only</li>
                        <li>Maximum file size: 10MB</li>
                    </ul>
                </div>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <Button label="Cancel" class="p-button-text" @click="closeImportDialog" />
                    <Button
                        label="Import"
                        @click="processImport"
                        :disabled="!selectedFiles.length"
                    />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.import-export {
    position: relative;
}

.actions-button {
    font-size: 14px;
}

.actions-menu {
    min-width: 200px;
}

/* Export Dialog */
.export-dialog .dialog-content {
    text-align: center;
    padding: 20px 0;
}

.success-icon {
    font-size: 48px;
    color: #22c55e;
    margin-bottom: 16px;
}

.success-message {
    color: #64748b;
    line-height: 1.6;
    margin: 0;
}

/* Import Dialog */
.import-dialog .dialog-content {
    padding: 8px 0;
}

.import-section {
    margin-bottom: 20px;
}

.import-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
}

.file-upload {
    width: 100%;
}

.selected-file {
    margin: 16px 0;
    padding: 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
}

.file-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.file-info .pi-file {
    color: #6366f1;
    font-size: 16px;
}

.file-name {
    flex: 1;
    font-size: 14px;
    color: #374151;
    font-weight: 500;
}

.remove-file-btn {
    padding: 4px;
    min-width: auto;
    height: auto;
}

.import-message {
    margin: 16px 0;
}

.import-warnings {
    margin: 16px 0;
    padding: 12px;
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 6px;
}

.warning-title {
    font-size: 14px;
    font-weight: 600;
    color: #92400e;
    margin: 0 0 8px 0;
}

.warning-list {
    margin: 0;
    padding-left: 16px;
    font-size: 13px;
    color: #92400e;
}

.warning-item {
    margin-bottom: 4px;
}

.import-errors {
    margin: 16px 0;
    padding: 12px;
    background: #fee2e2;
    border: 1px solid #ef4444;
    border-radius: 6px;
}

.error-title {
    font-size: 14px;
    font-weight: 600;
    color: #991b1b;
    margin: 0 0 8px 0;
}

.error-list {
    margin: 0;
    padding-left: 16px;
    font-size: 13px;
    color: #991b1b;
}

.error-item {
    margin-bottom: 4px;
}

.import-info {
    margin-top: 20px;
    padding: 16px;
    background: #f1f5f9;
    border-radius: 6px;
}

.info-title {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin: 0 0 8px 0;
}

.format-list {
    margin: 0;
    padding-left: 16px;
    font-size: 13px;
    color: #64748b;
}

.format-list li {
    margin-bottom: 4px;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

/* Responsive */
@media (max-width: 640px) {
    .actions-button {
        font-size: 12px;
    }

    .import-dialog,
    .export-dialog {
        width: 90vw !important;
        max-width: 400px;
    }
}
</style>
