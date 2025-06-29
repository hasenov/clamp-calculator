import type { Project, ProjectState, PresetConfig } from '../types/project.types'
import { LoggerService } from './logger.service'
import { NotificationService } from './notification.service'

export interface ExportData {
    version: string
    exportDate: string
    project?: Project
    projects?: Project[]
    metadata?: {
        appVersion?: string
        description?: string
        author?: string
    }
}

export interface ImportResult {
    success: boolean
    importedProjects: Project[]
    errors: string[]
    warnings: string[]
}

export interface ValidationResult {
    isValid: boolean
    errors: string[]
    warnings: string[]
}

export class ImportExportService {
    private static readonly CURRENT_VERSION = '1.0.0'
    private static readonly SUPPORTED_VERSIONS = ['1.0.0']
    private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

    static exportCurrentProject(project: Project): ExportData {
        LoggerService.info('Exporting current project', 'ImportExport', { projectId: project.id })

        return {
            version: this.CURRENT_VERSION,
            exportDate: new Date().toISOString(),
            project: this.sanitizeProjectForExport(project),
            metadata: {
                appVersion: '1.0.0',
                description: 'CSS Clamp Calculator Project Export',
                author: 'CSS Clamp Calculator',
            },
        }
    }

    static exportAllProjects(projects: Project[]): ExportData {
        LoggerService.info('Exporting all projects', 'ImportExport', {
            projectCount: projects.length,
        })

        return {
            version: this.CURRENT_VERSION,
            exportDate: new Date().toISOString(),
            projects: projects.map((project) => this.sanitizeProjectForExport(project)),
            metadata: {
                appVersion: '1.0.0',
                description: 'CSS Clamp Calculator All Projects Export',
                author: 'CSS Clamp Calculator',
            },
        }
    }

    static async importFromFile(file: File): Promise<ImportResult> {
        LoggerService.info('Starting import from file', 'ImportExport', {
            fileName: file.name,
            fileSize: file.size,
        })

        const result: ImportResult = {
            success: false,
            importedProjects: [],
            errors: [],
            warnings: [],
        }

        try {
            // Validate file
            const fileValidation = this.validateFile(file)
            if (!fileValidation.isValid) {
                result.errors.push(...fileValidation.errors)
                return result
            }

            // Parse JSON
            const content = await file.text()
            const data = JSON.parse(content)

            // Validate data structure
            const dataValidation = this.validateExportData(data)
            if (!dataValidation.isValid) {
                result.errors.push(...dataValidation.errors)
                return result
            }

            result.warnings.push(...dataValidation.warnings)

            // Process import
            const projects = data.project ? [data.project] : data.projects || []
            const processedProjects = projects.map((project: Record<string, any>) =>
                this.processImportedProject(project),
            )

            result.importedProjects = processedProjects
            result.success = true

            LoggerService.info('Import completed successfully', 'ImportExport', {
                importedCount: result.importedProjects.length,
            })

            return result
        } catch (error) {
            LoggerService.error('Import failed', 'ImportExport', error)
            result.errors.push('Failed to process import file')
            return result
        }
    }

    static mergeImportedProjects(
        existingState: ProjectState,
        importedProjects: Project[],
    ): ProjectState {
        LoggerService.info('Merging imported projects', 'ImportExport', {
            existingCount: existingState.projects.length,
            importedCount: importedProjects.length,
        })

        const mergedProjects = [...existingState.projects]
        const conflicts: string[] = []

        importedProjects.forEach((importedProject) => {
            const existingIndex = mergedProjects.findIndex(
                (p) => p.name.toLowerCase() === importedProject.name.toLowerCase(),
            )

            if (existingIndex >= 0) {
                // Handle conflict by appending timestamp
                const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
                importedProject.name = `${importedProject.name} (${timestamp})`
                conflicts.push(`Project "${importedProject.name}" renamed due to conflict`)
            }

            mergedProjects.push(importedProject)
        })

        if (conflicts.length > 0) {
            LoggerService.warn('Import conflicts resolved', 'ImportExport', { conflicts })
        }

        return {
            ...existingState,
            projects: mergedProjects,
        }
    }

    private static validateFile(file: File): ValidationResult {
        const errors: string[] = []
        const warnings: string[] = []

        // Check file size
        if (file.size > this.MAX_FILE_SIZE) {
            errors.push(`File size exceeds maximum limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`)
        }

        // Check file type
        if (!file.name.toLowerCase().endsWith('.json')) {
            errors.push('File must be a JSON file')
        }

        // Check if file is empty
        if (file.size === 0) {
            errors.push('File is empty')
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        }
    }

    private static validateExportData(data: any): ValidationResult {
        const errors: string[] = []
        const warnings: string[] = []

        // Check required fields
        if (!data.version) {
            errors.push('Missing version field')
        }

        if (!data.exportDate) {
            errors.push('Missing export date')
        }

        if (!data.project && !data.projects) {
            errors.push('Missing project or projects data')
        }

        // Check version compatibility
        if (data.version && !this.SUPPORTED_VERSIONS.includes(data.version)) {
            warnings.push(`Version ${data.version} may not be fully compatible`)
        }

        // Validate project structure if present
        if (data.project) {
            const projectValidation = this.validateProject(data.project)
            errors.push(...projectValidation.errors)
            warnings.push(...projectValidation.warnings)
        }

        // Validate projects array if present
        if (data.projects && Array.isArray(data.projects)) {
            data.projects.forEach((project: any, index: number) => {
                const projectValidation = this.validateProject(project)
                projectValidation.errors.forEach((error) =>
                    errors.push(`Project ${index + 1}: ${error}`),
                )
                projectValidation.warnings.forEach((warning) =>
                    warnings.push(`Project ${index + 1}: ${warning}`),
                )
            })
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        }
    }

    private static validateProject(project: any): ValidationResult {
        const errors: string[] = []
        const warnings: string[] = []

        // Check required project fields
        if (!project.id || typeof project.id !== 'string') {
            errors.push('Invalid or missing project ID')
        }

        if (!project.name || typeof project.name !== 'string') {
            errors.push('Invalid or missing project name')
        }

        if (!Array.isArray(project.presets)) {
            errors.push('Project presets must be an array')
        }

        // Validate presets
        if (Array.isArray(project.presets)) {
            project.presets.forEach((preset: any, index: number) => {
                const presetValidation = this.validatePreset(preset)
                presetValidation.errors.forEach((error) =>
                    errors.push(`Preset ${index + 1}: ${error}`),
                )
                presetValidation.warnings.forEach((warning) =>
                    warnings.push(`Preset ${index + 1}: ${warning}`),
                )
            })
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        }
    }

    private static validatePreset(preset: any): ValidationResult {
        const errors: string[] = []
        const warnings: string[] = []

        // Check required preset fields
        if (!preset.id || typeof preset.id !== 'string') {
            errors.push('Invalid or missing preset ID')
        }

        if (!preset.name || typeof preset.name !== 'string') {
            errors.push('Invalid or missing preset name')
        }

        // Validate configuration fields
        const requiredFields = ['rootFontSize', 'minDevice', 'maxDevice', 'unit', 'convertToRem']
        requiredFields.forEach((field) => {
            if (!(field in preset)) {
                errors.push(`Missing preset field: ${field}`)
            }
        })

        // Validate numeric fields
        if (typeof preset.minDevice !== 'number' || preset.minDevice < 0) {
            errors.push('Invalid minDevice value')
        }

        if (typeof preset.maxDevice !== 'number' || preset.maxDevice < 0) {
            errors.push('Invalid maxDevice value')
        }

        if (preset.minDevice >= preset.maxDevice) {
            errors.push('minDevice must be less than maxDevice')
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        }
    }

    private static sanitizeProjectForExport(project: Project): Project {
        return {
            ...project,
            presets: project.presets.map((preset) => ({
                ...preset,
                createdAt: new Date(preset.createdAt),
                updatedAt: new Date(preset.updatedAt),
            })),
            createdAt: new Date(project.createdAt),
            updatedAt: new Date(project.updatedAt),
        }
    }

    private static processImportedProject(project: Record<string, any>): Project {
        // Generate new IDs to avoid conflicts
        const newProjectId = this.generateId()
        const newPresets = (project.presets || []).map((preset: any) => ({
            ...preset,
            id: this.generateId(),
            createdAt: new Date(preset.createdAt || new Date()),
            updatedAt: new Date(preset.updatedAt || new Date()),
        }))

        return {
            id: newProjectId,
            name: project.name || 'Imported Project',
            presets: newPresets,
            createdAt: new Date(project.createdAt || new Date()),
            updatedAt: new Date(project.updatedAt || new Date()),
        }
    }

    private static generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2)
    }
}
