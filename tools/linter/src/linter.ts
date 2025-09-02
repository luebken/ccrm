import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { MarkdownParser } from './parsers/markdown.js';
import { FilenameValidator } from './utils/filename.js';
import { ContactValidator } from './validators/contact.js';
import { CompanyValidator } from './validators/company.js';
import { DealValidator } from './validators/deal.js';
import { ActivityValidator } from './validators/activity.js';
import { WikilinkValidator } from './validators/wikilinks.js';
import { ParsedEntity, Contact, Company, Deal, Activity } from './types/entities.js';
import { LinterOptions, LinterResult, ValidationResult, ValidationError } from './types/validation.js';

export class CRMLinter {
  private parser = new MarkdownParser();
  private filenameValidator = new FilenameValidator();
  private contactValidator = new ContactValidator();
  private companyValidator = new CompanyValidator();
  private dealValidator = new DealValidator();
  private activityValidator = new ActivityValidator();

  async lint(options: LinterOptions): Promise<LinterResult> {
    const entities = await this.loadEntities(options.crmPath, options.entityTypes);
    const results = new Map<string, ValidationResult>();
    
    // Initialize counters
    const summary = {
      contacts: { total: 0, valid: 0, errors: 0 },
      companies: { total: 0, valid: 0, errors: 0 },
      deals: { total: 0, valid: 0, errors: 0 },
      activities: { total: 0, valid: 0, errors: 0 }
    };

    // Validate each entity
    for (const entity of entities) {
      const result = this.validateEntity(entity, options);
      results.set(entity.filepath, result);
      
      // Update summary - handle plural forms correctly
      let summaryKey: keyof typeof summary;
      switch (entity.type) {
        case 'contact':
          summaryKey = 'contacts';
          break;
        case 'company':
          summaryKey = 'companies';
          break;
        case 'deal':
          summaryKey = 'deals';
          break;
        case 'activity':
          summaryKey = 'activities';
          break;
        default:
          console.error(`Unknown entity type: ${entity.type}`);
          continue;
      }
      
      const entitySummary = summary[summaryKey];
      entitySummary.total++;
      if (result.valid) {
        entitySummary.valid++;
      } else {
        entitySummary.errors += result.errors.length;
      }
    }

    // Cross-reference validation
    if (options.checkWikilinks !== false) {
      const wikilinkValidator = new WikilinkValidator(entities);
      
      for (const entity of entities) {
        const existingResult = results.get(entity.filepath)!;
        const wikilinkResult = wikilinkValidator.validate(entity);
        
        // Merge results
        const mergedResult: ValidationResult = {
          valid: existingResult.valid && wikilinkResult.valid,
          errors: [...existingResult.errors, ...wikilinkResult.errors],
          warnings: [...existingResult.warnings, ...wikilinkResult.warnings],
          info: [...existingResult.info, ...wikilinkResult.info]
        };
        
        results.set(entity.filepath, mergedResult);
      }
    }

    const totalFiles = entities.length;
    const validFiles = Array.from(results.values()).filter(r => r.valid).length;
    const totalErrors = Array.from(results.values()).reduce((sum, r) => sum + r.errors.length, 0);
    const totalWarnings = Array.from(results.values()).reduce((sum, r) => sum + r.warnings.length, 0);

    return {
      totalFiles,
      validFiles,
      totalErrors,
      totalWarnings,
      results,
      summary
    };
  }

  private async loadEntities(crmPath: string, entityTypes?: string[]): Promise<ParsedEntity[]> {
    const entities: ParsedEntity[] = [];
    const types = entityTypes || ['contacts', 'companies', 'deals', 'activities'];

    // Check for schema file and log if found
    const schemaPath = path.join(crmPath, 'crm.md');
    if (fs.existsSync(schemaPath)) {
      console.log('ℹ️  Found CRM schema file: crm.md (skipping validation)');
    }

    for (const type of types) {
      const pattern = path.join(crmPath, type, '*.md');
      const files = await glob(pattern);
      
      for (const file of files) {
        const entity = this.parser.parseFile(file);
        if (entity) {
          entities.push(entity);
        }
      }
    }

    return entities;
  }

  private validateEntity(entity: ParsedEntity, options: LinterOptions): ValidationResult {
    const errors: ValidationError[] = [];
    let validationResult: ValidationResult;

    // Filename validation
    const filenameErrors = this.filenameValidator.validateFilename(
      entity.filename, 
      entity.type, 
      entity.filepath
    );
    errors.push(...filenameErrors);

    // Entity-specific validation
    switch (entity.type) {
      case 'contact':
        validationResult = this.contactValidator.validate(entity.frontmatter as Contact, entity.filepath);
        break;
      case 'company':
        validationResult = this.companyValidator.validate(entity.frontmatter as Company, entity.filepath);
        break;
      case 'deal':
        validationResult = this.dealValidator.validate(entity.frontmatter as Deal, entity.filepath);
        break;
      case 'activity':
        validationResult = this.activityValidator.validate(entity.frontmatter as Activity, entity.filepath);
        break;
      default:
        validationResult = {
          valid: false,
          errors: [{
            severity: 'error',
            message: `Unknown entity type: ${entity.type}`,
            file: entity.filepath
          }],
          warnings: [],
          info: []
        };
    }

    // Merge filename errors with entity validation errors
    const mergedResult: ValidationResult = {
      valid: validationResult.valid && errors.filter(e => e.severity === 'error').length === 0,
      errors: [...errors.filter(e => e.severity === 'error'), ...validationResult.errors],
      warnings: [...errors.filter(e => e.severity === 'warning'), ...validationResult.warnings],
      info: [...errors.filter(e => e.severity === 'info'), ...validationResult.info]
    };

    return mergedResult;
  }

  formatResults(result: LinterResult, verbose: boolean = false): string {
    const output: string[] = [];
    
    // Summary
    output.push('='.repeat(60));
    output.push('CRM Linter Results');
    output.push('='.repeat(60));
    output.push(`Total files: ${result.totalFiles}`);
    output.push(`Valid files: ${result.validFiles}`);
    output.push(`Files with errors: ${result.totalFiles - result.validFiles}`);
    output.push(`Total errors: ${result.totalErrors}`);
    output.push(`Total warnings: ${result.totalWarnings}`);
    output.push('');

    // Entity breakdown
    output.push('Entity Breakdown:');
    for (const [type, stats] of Object.entries(result.summary)) {
      output.push(`  ${type}: ${stats.valid}/${stats.total} valid (${stats.errors} errors)`);
    }
    output.push('');

    // Detailed results
    if (verbose || result.totalErrors > 0) {
      output.push('Detailed Results:');
      output.push('-'.repeat(40));
      
      for (const [filepath, fileResult] of result.results) {
        if (!verbose && fileResult.valid) continue;
        
        const relativePath = filepath.replace(process.cwd(), '.');
        output.push(`\n📄 ${relativePath}`);
        
        if (fileResult.errors.length > 0) {
          output.push('  Errors:');
          fileResult.errors.forEach(error => {
            output.push(`    ❌ ${error.message}`);
            if (error.field) output.push(`       Field: ${error.field}`);
            if (error.suggestion) output.push(`       💡 ${error.suggestion}`);
          });
        }
        
        if (verbose && fileResult.warnings.length > 0) {
          output.push('  Warnings:');
          fileResult.warnings.forEach(warning => {
            output.push(`    ⚠️  ${warning.message}`);
            if (warning.field) output.push(`       Field: ${warning.field}`);
            if (warning.suggestion) output.push(`       💡 ${warning.suggestion}`);
          });
        }
        
        if (verbose && fileResult.info.length > 0) {
          output.push('  Info:');
          fileResult.info.forEach(info => {
            output.push(`    ℹ️  ${info.message}`);
            if (info.suggestion) output.push(`       💡 ${info.suggestion}`);
          });
        }
      }
    }

    return output.join('\n');
  }
}