import { Activity } from '../types/entities.js';
import { ValidationError, ValidationResult } from '../types/validation.js';

export class ActivityValidator {
  validate(activity: Activity, filepath: string): ValidationResult {
    const errors: ValidationError[] = [];

    this.validateRequiredFields(activity, filepath, errors);
    this.validateFieldTypes(activity, filepath, errors);
    this.validateEnumFields(activity, filepath, errors);
    this.validateFieldFormats(activity, filepath, errors);
    this.validateBusinessLogic(activity, filepath, errors);

    return {
      valid: errors.filter(e => e.severity === 'error').length === 0,
      errors: errors.filter(e => e.severity === 'error'),
      warnings: errors.filter(e => e.severity === 'warning'),
      info: errors.filter(e => e.severity === 'info')
    };
  }

  private validateRequiredFields(activity: Activity, filepath: string, errors: ValidationError[]) {
    const required = ['type', 'subject', 'date', 'status', 'owner', 'created_at'];
    
    for (const field of required) {
      if (!activity[field as keyof Activity]) {
        errors.push({
          severity: 'error',
          message: `Missing required field: ${field}`,
          file: filepath,
          field,
          suggestion: `Add ${field} to the frontmatter`
        });
      }
    }
  }

  private validateFieldTypes(activity: Activity, filepath: string, errors: ValidationError[]) {
    if (activity.contacts && !Array.isArray(activity.contacts)) {
      errors.push({
        severity: 'error',
        message: 'Field "contacts" must be an array',
        file: filepath,
        field: 'contacts'
      });
    }

    if (activity.tags && !Array.isArray(activity.tags)) {
      errors.push({
        severity: 'error',
        message: 'Field "tags" must be an array',
        file: filepath,
        field: 'tags'
      });
    }

    if (activity.duration && typeof activity.duration !== 'number') {
      errors.push({
        severity: 'error',
        message: 'Field "duration" must be a number (minutes)',
        file: filepath,
        field: 'duration'
      });
    }
  }

  private validateEnumFields(activity: Activity, filepath: string, errors: ValidationError[]) {
    const validTypes = ['meeting', 'call', 'email', 'note', 'task'];
    if (activity.type && !validTypes.includes(activity.type)) {
      errors.push({
        severity: 'error',
        message: `Invalid activity type: ${activity.type}`,
        file: filepath,
        field: 'type',
        suggestion: `Must be one of: ${validTypes.join(', ')}`
      });
    }

    const validStatuses = ['scheduled', 'completed', 'cancelled', 'no-show'];
    if (activity.status && !validStatuses.includes(activity.status)) {
      errors.push({
        severity: 'error',
        message: `Invalid activity status: ${activity.status}`,
        file: filepath,
        field: 'status',
        suggestion: `Must be one of: ${validStatuses.join(', ')}`
      });
    }
  }

  private validateFieldFormats(activity: Activity, filepath: string, errors: ValidationError[]) {
    if (activity.duration && activity.duration < 0) {
      errors.push({
        severity: 'warning',
        message: 'Duration should not be negative',
        file: filepath,
        field: 'duration'
      });
    }

    if (activity.duration && activity.duration > 480) { // 8 hours
      errors.push({
        severity: 'warning',
        message: 'Duration seems unusually long (over 8 hours)',
        file: filepath,
        field: 'duration'
      });
    }

    if (activity.date && !this.isValidDateTime(activity.date)) {
      errors.push({
        severity: 'error',
        message: 'Invalid date format',
        file: filepath,
        field: 'date',
        suggestion: 'Use ISO datetime format like 2024-01-15T10:30:00Z or 2024-01-15 10:30'
      });
    }

    if (activity.created_at && !this.isValidDate(activity.created_at)) {
      errors.push({
        severity: 'error',
        message: 'Invalid created_at date format',
        file: filepath,
        field: 'created_at',
        suggestion: 'Use ISO date format like 2024-01-15 or 2024-01-15T10:30:00Z'
      });
    }
  }

  private validateBusinessLogic(activity: Activity, filepath: string, errors: ValidationError[]) {
    if ((activity.type === 'meeting' || activity.type === 'call') && !activity.duration) {
      errors.push({
        severity: 'warning',
        message: 'Meetings and calls should have a duration',
        file: filepath,
        field: 'duration',
        suggestion: 'Add duration in minutes'
      });
    }

    if (activity.type === 'task' && activity.status === 'no-show') {
      errors.push({
        severity: 'warning',
        message: 'Tasks cannot have "no-show" status',
        file: filepath,
        field: 'status',
        suggestion: 'Use completed, cancelled, or scheduled for tasks'
      });
    }

    if (!activity.contacts && !activity.company) {
      errors.push({
        severity: 'warning',
        message: 'Activity should be linked to at least one contact or company',
        file: filepath,
        suggestion: 'Add contacts array or company wikilink'
      });
    }

    if (activity.status === 'completed' && !activity.outcome) {
      errors.push({
        severity: 'info',
        message: 'Completed activities should include an outcome',
        file: filepath,
        field: 'outcome',
        suggestion: 'Add brief summary of the activity outcome'
      });
    }
  }

  private isValidDateTime(date: string): boolean {
    const datetimeRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d{3})?Z?|( \d{2}:\d{2})?)$/;
    return datetimeRegex.test(date) && !isNaN(Date.parse(date));
  }

  private isValidDate(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
    return dateRegex.test(date) && !isNaN(Date.parse(date));
  }
}