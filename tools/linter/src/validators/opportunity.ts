import { Opportunity } from '../types/entities.js';
import { ValidationError, ValidationResult } from '../types/validation.js';

export class OpportunityValidator {
  validate(opportunity: Opportunity, filepath: string): ValidationResult {
    const errors: ValidationError[] = [];

    this.validateRequiredFields(opportunity, filepath, errors);
    this.validateFieldTypes(opportunity, filepath, errors);
    this.validateEnumFields(opportunity, filepath, errors);
    this.validateFieldFormats(opportunity, filepath, errors);
    this.validateBusinessLogic(opportunity, filepath, errors);

    return {
      valid: errors.filter(e => e.severity === 'error').length === 0,
      errors: errors.filter(e => e.severity === 'error'),
      warnings: errors.filter(e => e.severity === 'warning'),
      info: errors.filter(e => e.severity === 'info')
    };
  }

  private validateRequiredFields(opportunity: Opportunity, filepath: string, errors: ValidationError[]) {
    const required = ['name', 'stage', 'company', 'type', 'owner', 'created_at', 'updated_at'];
    
    for (const field of required) {
      if (!opportunity[field as keyof Opportunity]) {
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

  private validateFieldTypes(opportunity: Opportunity, filepath: string, errors: ValidationError[]) {
    if (opportunity.contacts && !Array.isArray(opportunity.contacts)) {
      errors.push({
        severity: 'error',
        message: 'Field "contacts" must be an array',
        file: filepath,
        field: 'contacts'
      });
    }

    if (opportunity.tags && !Array.isArray(opportunity.tags)) {
      errors.push({
        severity: 'error',
        message: 'Field "tags" must be an array',
        file: filepath,
        field: 'tags'
      });
    }

    if (opportunity.amount && typeof opportunity.amount !== 'number') {
      errors.push({
        severity: 'error',
        message: 'Field "amount" must be a number',
        file: filepath,
        field: 'amount'
      });
    }

    if (opportunity.probability && typeof opportunity.probability !== 'number') {
      errors.push({
        severity: 'error',
        message: 'Field "probability" must be a number',
        file: filepath,
        field: 'probability'
      });
    }
  }

  private validateEnumFields(opportunity: Opportunity, filepath: string, errors: ValidationError[]) {
    const validStages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];
    if (opportunity.stage && !validStages.includes(opportunity.stage)) {
      errors.push({
        severity: 'error',
        message: `Invalid opportunity stage: ${opportunity.stage}`,
        file: filepath,
        field: 'stage',
        suggestion: `Must be one of: ${validStages.join(', ')}`
      });
    }

    const validTypes = ['new-business', 'renewal', 'upsell', 'cross-sell'];
    if (opportunity.type && !validTypes.includes(opportunity.type)) {
      errors.push({
        severity: 'error',
        message: `Invalid opportunity type: ${opportunity.type}`,
        file: filepath,
        field: 'type',
        suggestion: `Must be one of: ${validTypes.join(', ')}`
      });
    }

    const validLostReasons = ['competitor', 'budget', 'timing', 'other'];
    if (opportunity.lost_reason && !validLostReasons.includes(opportunity.lost_reason)) {
      errors.push({
        severity: 'error',
        message: `Invalid lost reason: ${opportunity.lost_reason}`,
        file: filepath,
        field: 'lost_reason',
        suggestion: `Must be one of: ${validLostReasons.join(', ')}`
      });
    }
  }

  private validateFieldFormats(opportunity: Opportunity, filepath: string, errors: ValidationError[]) {
    if (opportunity.probability && (opportunity.probability < 0 || opportunity.probability > 100)) {
      errors.push({
        severity: 'error',
        message: 'Probability must be between 0 and 100',
        file: filepath,
        field: 'probability'
      });
    }

    if (opportunity.amount && opportunity.amount < 0) {
      errors.push({
        severity: 'warning',
        message: 'Opportunity amount should not be negative',
        file: filepath,
        field: 'amount'
      });
    }

    if (opportunity.expected_close_date && !this.isValidDate(opportunity.expected_close_date)) {
      errors.push({
        severity: 'warning',
        message: 'Invalid expected_close_date format',
        file: filepath,
        field: 'expected_close_date',
        suggestion: 'Use ISO date format like 2024-01-15'
      });
    }

    if (opportunity.closed_at && !this.isValidDate(opportunity.closed_at)) {
      errors.push({
        severity: 'error',
        message: 'Invalid closed_at date format',
        file: filepath,
        field: 'closed_at',
        suggestion: 'Use ISO date format like 2024-01-15 or 2024-01-15T10:30:00Z'
      });
    }

    if (opportunity.created_at && !this.isValidDate(opportunity.created_at)) {
      errors.push({
        severity: 'error',
        message: 'Invalid created_at date format',
        file: filepath,
        field: 'created_at',
        suggestion: 'Use ISO date format like 2024-01-15 or 2024-01-15T10:30:00Z'
      });
    }

    if (opportunity.updated_at && !this.isValidDate(opportunity.updated_at)) {
      errors.push({
        severity: 'error',
        message: 'Invalid updated_at date format',
        file: filepath,
        field: 'updated_at',
        suggestion: 'Use ISO date format like 2024-01-15 or 2024-01-15T10:30:00Z'
      });
    }
  }

  private validateBusinessLogic(opportunity: Opportunity, filepath: string, errors: ValidationError[]) {
    if ((opportunity.stage === 'closed-won' || opportunity.stage === 'closed-lost') && !opportunity.closed_at) {
      errors.push({
        severity: 'error',
        message: 'Closed opportunities must have a closed_at date',
        file: filepath,
        suggestion: 'Add closed_at field with the actual close date'
      });
    }

    if (opportunity.stage === 'closed-lost' && !opportunity.lost_reason) {
      errors.push({
        severity: 'warning',
        message: 'Lost opportunities should include a lost_reason',
        file: filepath,
        field: 'lost_reason',
        suggestion: 'Add lost_reason: competitor | budget | timing | other'
      });
    }

    if (opportunity.closed_at && opportunity.stage !== 'closed-won' && opportunity.stage !== 'closed-lost') {
      errors.push({
        severity: 'warning',
        message: 'Opportunity has closed_at date but stage is not closed',
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