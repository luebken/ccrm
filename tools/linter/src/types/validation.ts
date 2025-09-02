export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationError {
  severity: ValidationSeverity;
  message: string;
  file: string;
  field?: string;
  line?: number;
  suggestion?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  info: ValidationError[];
}

export interface LinterOptions {
  crmPath: string;
  verbose?: boolean;
  strict?: boolean;
  checkWikilinks?: boolean;
  entityTypes?: string[];
}

export interface LinterResult {
  totalFiles: number;
  validFiles: number;
  totalErrors: number;
  totalWarnings: number;
  results: Map<string, ValidationResult>;
  summary: {
    contacts: { total: number; valid: number; errors: number };
    companies: { total: number; valid: number; errors: number };
    deals: { total: number; valid: number; errors: number };
    activities: { total: number; valid: number; errors: number };
  };
}