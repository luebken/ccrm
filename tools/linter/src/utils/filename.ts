import { EntityType } from '../types/entities.js';
import { ValidationError } from '../types/validation.js';

export class FilenameValidator {
  validateFilename(filename: string, entityType: EntityType, filepath: string): ValidationError[] {
    const errors: ValidationError[] = [];
    
    switch (entityType) {
      case 'contact':
        this.validateContactFilename(filename, filepath, errors);
        break;
      case 'company':
        this.validateCompanyFilename(filename, filepath, errors);
        break;
      case 'opportunity':
        this.validateOpportunityFilename(filename, filepath, errors);
        break;
      case 'activity':
        this.validateActivityFilename(filename, filepath, errors);
        break;
    }
    
    return errors;
  }

  private validateContactFilename(filename: string, filepath: string, errors: ValidationError[]) {
    const pattern = /^[a-z]+-[a-z]+(-[a-z]+)*$/;
    if (!pattern.test(filename)) {
      errors.push({
        severity: 'error',
        message: 'Contact filename must follow pattern: lastname-firstname.md',
        file: filepath,
        suggestion: 'Use format like "smith-john.md" with lowercase letters and hyphens'
      });
    }
    
    if (filename.includes('_') || filename.includes(' ')) {
      errors.push({
        severity: 'error',
        message: 'Contact filename cannot contain underscores or spaces',
        file: filepath,
        suggestion: 'Use hyphens instead of underscores or spaces'
      });
    }
  }

  private validateCompanyFilename(filename: string, filepath: string, errors: ValidationError[]) {
    const pattern = /^[a-z0-9]+([-][a-z0-9]+)*$/;
    if (!pattern.test(filename)) {
      errors.push({
        severity: 'error',
        message: 'Company filename must be lowercase with hyphens',
        file: filepath,
        suggestion: 'Use format like "acme-corp.md" with lowercase letters, numbers, and hyphens'
      });
    }
  }

  private validateOpportunityFilename(filename: string, filepath: string, errors: ValidationError[]) {
    const pattern = /^[a-z0-9]+([-][a-z0-9]+)*-\d{4}-q[1-4]-[a-z]+([-][a-z]+)*$/;
    if (!pattern.test(filename)) {
      errors.push({
        severity: 'error',
        message: 'Opportunity filename must follow pattern: company-YYYY-qN-description.md',
        file: filepath,
        suggestion: 'Use format like "acme-2024-q1-expansion.md"'
      });
    }
  }

  private validateActivityFilename(filename: string, filepath: string, errors: ValidationError[]) {
    const pattern = /^\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-(meeting|call|email|note|task)-[a-z0-9]+([-][a-z0-9]+)*$/;
    if (!pattern.test(filename)) {
      errors.push({
        severity: 'error',
        message: 'Activity filename must follow pattern: YYYY-MM-DD-HH-MM-type-subject.md',
        file: filepath,
        suggestion: 'Use format like "2024-03-15-14-30-meeting-quarterly-review.md"'
      });
    }
  }

  hasInvalidCharacters(filename: string): string[] {
    const invalidChars = ['#', '|', '^', ':', '%', '[', ']'];
    return invalidChars.filter(char => filename.includes(char));
  }
}