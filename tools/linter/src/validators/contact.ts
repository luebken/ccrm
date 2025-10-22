import { Contact } from '../types/entities.js';
import { ValidationError, ValidationResult } from '../types/validation.js';

export class ContactValidator {
  validate(contact: Contact, filepath: string): ValidationResult {
    const errors: ValidationError[] = [];

    this.validateRequiredFields(contact, filepath, errors);
    this.validateFieldTypes(contact, filepath, errors);
    this.validateFieldFormats(contact, filepath, errors);

    return {
      valid: errors.filter(e => e.severity === 'error').length === 0,
      errors: errors.filter(e => e.severity === 'error'),
      warnings: errors.filter(e => e.severity === 'warning'),
      info: errors.filter(e => e.severity === 'info')
    };
  }

  private validateRequiredFields(contact: Contact, filepath: string, errors: ValidationError[]) {
    const required = ['first_name', 'last_name', 'owner', 'created_at', 'updated_at'];
    
    for (const field of required) {
      if (!contact[field as keyof Contact]) {
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

  private validateFieldTypes(contact: Contact, filepath: string, errors: ValidationError[]) {
    if (contact.companies && !Array.isArray(contact.companies)) {
      errors.push({
        severity: 'error',
        message: 'Field "companies" must be an array',
        file: filepath,
        field: 'companies'
      });
    }

    if (contact.opportunities && !Array.isArray(contact.opportunities)) {
      errors.push({
        severity: 'error',
        message: 'Field "opportunities" must be an array',
        file: filepath,
        field: 'opportunities'
      });
    }

    if (contact.tags && !Array.isArray(contact.tags)) {
      errors.push({
        severity: 'error',
        message: 'Field "tags" must be an array',
        file: filepath,
        field: 'tags'
      });
    }
  }

  private validateFieldFormats(contact: Contact, filepath: string, errors: ValidationError[]) {
    if (contact.email && !this.isValidEmail(contact.email)) {
      errors.push({
        severity: 'warning',
        message: 'Invalid email format',
        file: filepath,
        field: 'email',
        suggestion: 'Use valid email format like user@domain.com'
      });
    }

    if (contact.created_at && !this.isValidDate(contact.created_at)) {
      errors.push({
        severity: 'error',
        message: 'Invalid created_at date format',
        file: filepath,
        field: 'created_at',
        suggestion: 'Use ISO date format like 2024-01-15 or 2024-01-15T10:30:00Z'
      });
    }

    if (contact.updated_at && !this.isValidDate(contact.updated_at)) {
      errors.push({
        severity: 'error',
        message: 'Invalid updated_at date format',
        file: filepath,
        field: 'updated_at',
        suggestion: 'Use ISO date format like 2024-01-15 or 2024-01-15T10:30:00Z'
      });
    }

    if (contact.last_contacted && !this.isValidDate(contact.last_contacted)) {
      errors.push({
        severity: 'warning',
        message: 'Invalid last_contacted date format',
        file: filepath,
        field: 'last_contacted',
        suggestion: 'Use ISO date format like 2024-01-15 or 2024-01-15T10:30:00Z'
      });
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidDate(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
    return dateRegex.test(date) && !isNaN(Date.parse(date));
  }
}