import { Company } from '../types/entities.js';
import { ValidationError, ValidationResult } from '../types/validation.js';

export class CompanyValidator {
  validate(company: Company, filepath: string): ValidationResult {
    const errors: ValidationError[] = [];

    this.validateRequiredFields(company, filepath, errors);
    this.validateFieldTypes(company, filepath, errors);
    this.validateEnumFields(company, filepath, errors);
    this.validateFieldFormats(company, filepath, errors);

    return {
      valid: errors.filter(e => e.severity === 'error').length === 0,
      errors: errors.filter(e => e.severity === 'error'),
      warnings: errors.filter(e => e.severity === 'warning'),
      info: errors.filter(e => e.severity === 'info')
    };
  }

  private validateRequiredFields(company: Company, filepath: string, errors: ValidationError[]) {
    const required = ['name', 'type', 'owner', 'created_at', 'updated_at'];
    
    for (const field of required) {
      if (!company[field as keyof Company]) {
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

  private validateFieldTypes(company: Company, filepath: string, errors: ValidationError[]) {
    if (company.contacts && !Array.isArray(company.contacts)) {
      errors.push({
        severity: 'error',
        message: 'Field "contacts" must be an array',
        file: filepath,
        field: 'contacts'
      });
    }

    if (company.opportunities && !Array.isArray(company.opportunities)) {
      errors.push({
        severity: 'error',
        message: 'Field "opportunities" must be an array',
        file: filepath,
        field: 'opportunities'
      });
    }

    if (company.tags && !Array.isArray(company.tags)) {
      errors.push({
        severity: 'error',
        message: 'Field "tags" must be an array',
        file: filepath,
        field: 'tags'
      });
    }
  }

  private validateEnumFields(company: Company, filepath: string, errors: ValidationError[]) {
    const validTypes = ['prospect', 'customer', 'partner', 'vendor', 'other'];
    if (company.type && !validTypes.includes(company.type)) {
      errors.push({
        severity: 'error',
        message: `Invalid company type: ${company.type}`,
        file: filepath,
        field: 'type',
        suggestion: `Must be one of: ${validTypes.join(', ')}`
      });
    }

    const validSizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
    if (company.size && !validSizes.includes(company.size)) {
      errors.push({
        severity: 'error',
        message: `Invalid company size: ${company.size}`,
        file: filepath,
        field: 'size',
        suggestion: `Must be one of: ${validSizes.join(', ')}`
      });
    }
  }

  private validateFieldFormats(company: Company, filepath: string, errors: ValidationError[]) {
    if (company.domain && !this.isValidDomain(company.domain)) {
      errors.push({
        severity: 'warning',
        message: 'Invalid domain format',
        file: filepath,
        field: 'domain',
        suggestion: 'Use format like "example.com" or "https://example.com"'
      });
    }

    if (company.created_at && !this.isValidDate(company.created_at)) {
      errors.push({
        severity: 'error',
        message: 'Invalid created_at date format',
        file: filepath,
        field: 'created_at',
        suggestion: 'Use ISO date format like 2024-01-15 or 2024-01-15T10:30:00Z'
      });
    }

    if (company.updated_at && !this.isValidDate(company.updated_at)) {
      errors.push({
        severity: 'error',
        message: 'Invalid updated_at date format',
        file: filepath,
        field: 'updated_at',
        suggestion: 'Use ISO date format like 2024-01-15 or 2024-01-15T10:30:00Z'
      });
    }
  }

  private isValidDomain(domain: string): boolean {
    const domainRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
    return domainRegex.test(domain);
  }

  private isValidDate(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
    return dateRegex.test(date) && !isNaN(Date.parse(date));
  }
}