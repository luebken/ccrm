import { Deal } from '../types/entities.js';
import { ValidationError, ValidationResult } from '../types/validation.js';

export class DealValidator {
  validate(deal: Deal, filepath: string): ValidationResult {
    const errors: ValidationError[] = [];

    this.validateRequiredFields(deal, filepath, errors);
    this.validateFieldTypes(deal, filepath, errors);
    this.validateEnumFields(deal, filepath, errors);
    this.validateFieldFormats(deal, filepath, errors);
    this.validateBusinessLogic(deal, filepath, errors);

    return {
      valid: errors.filter(e => e.severity === 'error').length === 0,
      errors: errors.filter(e => e.severity === 'error'),
      warnings: errors.filter(e => e.severity === 'warning'),
      info: errors.filter(e => e.severity === 'info')
    };
  }

  private validateRequiredFields(deal: Deal, filepath: string, errors: ValidationError[]) {
    const required = ['name', 'stage', 'company', 'type', 'owner', 'created_at', 'updated_at'];
    
    for (const field of required) {
      if (!deal[field as keyof Deal]) {
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

  private validateFieldTypes(deal: Deal, filepath: string, errors: ValidationError[]) {
    if (deal.contacts && !Array.isArray(deal.contacts)) {
      errors.push({
        severity: 'error',
        message: 'Field "contacts" must be an array',
        file: filepath,
        field: 'contacts'
      });
    }

    if (deal.tags && !Array.isArray(deal.tags)) {
      errors.push({
        severity: 'error',
        message: 'Field "tags" must be an array',
        file: filepath,
        field: 'tags'
      });
    }

    if (deal.amount && typeof deal.amount !== 'number') {
      errors.push({
        severity: 'error',
        message: 'Field "amount" must be a number',
        file: filepath,
        field: 'amount'
      });
    }

    if (deal.probability && typeof deal.probability !== 'number') {
      errors.push({
        severity: 'error',
        message: 'Field "probability" must be a number',
        file: filepath,
        field: 'probability'
      });
    }
  }

  private validateEnumFields(deal: Deal, filepath: string, errors: ValidationError[]) {
    const validStages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];
    if (deal.stage && !validStages.includes(deal.stage)) {
      errors.push({
        severity: 'error',
        message: `Invalid deal stage: ${deal.stage}`,
        file: filepath,
        field: 'stage',
        suggestion: `Must be one of: ${validStages.join(', ')}`
      });
    }

    const validTypes = ['new-business', 'renewal', 'upsell', 'cross-sell'];
    if (deal.type && !validTypes.includes(deal.type)) {
      errors.push({
        severity: 'error',
        message: `Invalid deal type: ${deal.type}`,
        file: filepath,
        field: 'type',
        suggestion: `Must be one of: ${validTypes.join(', ')}`
      });
    }

    const validLostReasons = ['competitor', 'budget', 'timing', 'other'];
    if (deal.lost_reason && !validLostReasons.includes(deal.lost_reason)) {
      errors.push({
        severity: 'error',
        message: `Invalid lost reason: ${deal.lost_reason}`,
        file: filepath,
        field: 'lost_reason',
        suggestion: `Must be one of: ${validLostReasons.join(', ')}`
      });
    }
  }

  private validateFieldFormats(deal: Deal, filepath: string, errors: ValidationError[]) {
    if (deal.probability && (deal.probability < 0 || deal.probability > 100)) {
      errors.push({
        severity: 'error',
        message: 'Probability must be between 0 and 100',
        file: filepath,
        field: 'probability'
      });
    }

    if (deal.amount && deal.amount < 0) {
      errors.push({
        severity: 'warning',
        message: 'Deal amount should not be negative',
        file: filepath,
        field: 'amount'
      });
    }

    if (deal.expected_close_date && !this.isValidDate(deal.expected_close_date)) {
      errors.push({
        severity: 'warning',
        message: 'Invalid expected_close_date format',
        file: filepath,
        field: 'expected_close_date',
        suggestion: 'Use ISO date format like 2024-01-15'
      });
    }

    if (deal.closed_at && !this.isValidDate(deal.closed_at)) {
      errors.push({
        severity: 'error',
        message: 'Invalid closed_at date format',
        file: filepath,
        field: 'closed_at',
        suggestion: 'Use ISO date format like 2024-01-15 or 2024-01-15T10:30:00Z'
      });
    }

    if (deal.created_at && !this.isValidDate(deal.created_at)) {
      errors.push({
        severity: 'error',
        message: 'Invalid created_at date format',
        file: filepath,
        field: 'created_at',
        suggestion: 'Use ISO date format like 2024-01-15 or 2024-01-15T10:30:00Z'
      });
    }

    if (deal.updated_at && !this.isValidDate(deal.updated_at)) {
      errors.push({
        severity: 'error',
        message: 'Invalid updated_at date format',
        file: filepath,
        field: 'updated_at',
        suggestion: 'Use ISO date format like 2024-01-15 or 2024-01-15T10:30:00Z'
      });
    }
  }

  private validateBusinessLogic(deal: Deal, filepath: string, errors: ValidationError[]) {
    if ((deal.stage === 'closed-won' || deal.stage === 'closed-lost') && !deal.closed_at) {
      errors.push({
        severity: 'error',
        message: 'Closed deals must have a closed_at date',
        file: filepath,
        suggestion: 'Add closed_at field with the actual close date'
      });
    }

    if (deal.stage === 'closed-lost' && !deal.lost_reason) {
      errors.push({
        severity: 'warning',
        message: 'Lost deals should include a lost_reason',
        file: filepath,
        field: 'lost_reason',
        suggestion: 'Add lost_reason: competitor | budget | timing | other'
      });
    }

    if (deal.closed_at && deal.stage !== 'closed-won' && deal.stage !== 'closed-lost') {
      errors.push({
        severity: 'warning',
        message: 'Deal has closed_at date but stage is not closed',
        file: filepath,
        suggestion: 'Update stage to closed-won or closed-lost, or remove closed_at'
      });
    }
  }

  private isValidDate(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
    return dateRegex.test(date) && !isNaN(Date.parse(date));
  }
}