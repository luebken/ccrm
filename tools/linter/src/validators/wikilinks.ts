import * as fs from 'fs';
import * as path from 'path';
import { ParsedEntity } from '../types/entities.js';
import { ValidationError, ValidationResult } from '../types/validation.js';
import { MarkdownParser } from '../parsers/markdown.js';

export class WikilinkValidator {
  private parser = new MarkdownParser();
  private entityMap = new Map<string, ParsedEntity>();

  constructor(entities: ParsedEntity[]) {
    entities.forEach(entity => {
      const relativePath = this.getRelativePath(entity.filepath);
      this.entityMap.set(relativePath, entity);
    });
  }

  validate(entity: ParsedEntity): ValidationResult {
    const errors: ValidationError[] = [];

    this.validateFrontmatterWikilinks(entity, errors);
    this.validateContentWikilinks(entity, errors);
    this.validateCrossReferences(entity, errors);

    return {
      valid: errors.filter(e => e.severity === 'error').length === 0,
      errors: errors.filter(e => e.severity === 'error'),
      warnings: errors.filter(e => e.severity === 'warning'),
      info: errors.filter(e => e.severity === 'info')
    };
  }

  private validateFrontmatterWikilinks(entity: ParsedEntity, errors: ValidationError[]) {
    const frontmatterLinks = this.parser.extractWikilinksFromFrontmatter(entity.frontmatter);
    
    frontmatterLinks.forEach(link => {
      if (!this.isValidWikilinkFormat(link)) {
        errors.push({
          severity: 'error',
          message: `Invalid wikilink format in frontmatter: [[${link}]]`,
          file: entity.filepath,
          suggestion: 'Use format like [[contacts/smith-john]] or [[companies/acme-corp]]'
        });
      } else if (!this.wikilinkExists(link)) {
        errors.push({
          severity: 'error',
          message: `Broken wikilink in frontmatter: [[${link}]]`,
          file: entity.filepath,
          suggestion: 'Check if the referenced entity exists or fix the path'
        });
      }
    });
  }

  private validateContentWikilinks(entity: ParsedEntity, errors: ValidationError[]) {
    const contentLinks = this.parser.extractWikilinks(entity.content);
    
    contentLinks.forEach(link => {
      const cleanLink = link.split('#')[0]; // Remove heading references
      
      if (!this.isValidWikilinkFormat(cleanLink)) {
        errors.push({
          severity: 'error',
          message: `Invalid wikilink format in content: [[${link}]]`,
          file: entity.filepath,
          suggestion: 'Use format like [[contacts/smith-john]] or [[companies/acme-corp]]'
        });
      } else if (!this.wikilinkExists(cleanLink)) {
        errors.push({
          severity: 'error',
          message: `Broken wikilink in content: [[${link}]]`,
          file: entity.filepath,
          suggestion: 'Check if the referenced entity exists or fix the path'
        });
      }
    });
  }

  private validateCrossReferences(entity: ParsedEntity, errors: ValidationError[]) {
    switch (entity.type) {
      case 'contact':
        this.validateContactReferences(entity, errors);
        break;
      case 'company':
        this.validateCompanyReferences(entity, errors);
        break;
      case 'opportunity':
        this.validateOpportunityReferences(entity, errors);
        break;
      case 'activity':
        this.validateActivityReferences(entity, errors);
        break;
    }
  }

  private validateContactReferences(entity: ParsedEntity, errors: ValidationError[]) {
    const contact = entity.frontmatter as any;
    
    // Check if contact is listed in referenced company's contacts
    if (contact.company) {
      const companyEntity = this.entityMap.get(contact.company);
      if (companyEntity) {
        const company = companyEntity.frontmatter as any;
        const contactPath = this.getRelativePath(entity.filepath);
        
        if (!company.contacts?.includes(`[[${contactPath}]]`)) {
          errors.push({
            severity: 'warning',
            message: `Contact not listed in company's contacts array`,
            file: entity.filepath,
            suggestion: `Add [[${contactPath}]] to ${contact.company} contacts array`
          });
        }
      }
    }

    // Check deals references
    if (contact.deals) {
      contact.deals.forEach((deal: string) => {
        const dealEntity = this.entityMap.get(deal);
        if (dealEntity) {
          const dealData = dealEntity.frontmatter as any;
          const contactPath = this.getRelativePath(entity.filepath);
          
          if (!dealData.contacts?.includes(`[[${contactPath}]]`)) {
            errors.push({
              severity: 'warning',
              message: `Contact not listed in deal's contacts array`,
              file: entity.filepath,
              suggestion: `Add [[${contactPath}]] to ${deal} contacts array`
            });
          }
        }
      });
    }
  }

  private validateCompanyReferences(entity: ParsedEntity, errors: ValidationError[]) {
    const company = entity.frontmatter as any;
    
    // Check if contacts reference this company
    if (company.contacts) {
      company.contacts.forEach((contact: string) => {
        const contactEntity = this.entityMap.get(contact);
        if (contactEntity) {
          const contactData = contactEntity.frontmatter as any;
          const companyPath = this.getRelativePath(entity.filepath);
          
          if (contactData.company !== `[[${companyPath}]]` && 
              !contactData.companies?.includes(`[[${companyPath}]]`)) {
            errors.push({
              severity: 'warning',
              message: `Company not referenced in contact's company fields`,
              file: entity.filepath,
              suggestion: `Add [[${companyPath}]] to ${contact} company or companies field`
            });
          }
        }
      });
    }

    // Check deals references
    if (company.deals) {
      company.deals.forEach((deal: string) => {
        const dealEntity = this.entityMap.get(deal);
        if (dealEntity) {
          const dealData = dealEntity.frontmatter as any;
          const companyPath = this.getRelativePath(entity.filepath);
          
          if (dealData.company !== `[[${companyPath}]]`) {
            errors.push({
              severity: 'error',
              message: `Deal does not reference this company`,
              file: entity.filepath,
              suggestion: `Set company field in ${deal} to [[${companyPath}]]`
            });
          }
        }
      });
    }
  }

  private validateOpportunityReferences(entity: ParsedEntity, errors: ValidationError[]) {
    const deal = entity.frontmatter as any;
    
    // Check if company lists this deal
    if (deal.company) {
      const companyEntity = this.entityMap.get(deal.company);
      if (companyEntity) {
        const companyData = companyEntity.frontmatter as any;
        const dealPath = this.getRelativePath(entity.filepath);
        
        if (!companyData.deals?.includes(`[[${dealPath}]]`)) {
          errors.push({
            severity: 'warning',
            message: `Deal not listed in company's deals array`,
            file: entity.filepath,
            suggestion: `Add [[${dealPath}]] to ${deal.company} deals array`
          });
        }
      }
    }

    // Check contacts references
    if (deal.contacts) {
      deal.contacts.forEach((contact: string) => {
        const contactEntity = this.entityMap.get(contact);
        if (contactEntity) {
          const contactData = contactEntity.frontmatter as any;
          const dealPath = this.getRelativePath(entity.filepath);
          
          if (!contactData.deals?.includes(`[[${dealPath}]]`)) {
            errors.push({
              severity: 'warning',
              message: `Deal not listed in contact's deals array`,
              file: entity.filepath,
              suggestion: `Add [[${dealPath}]] to ${contact} deals array`
            });
          }
        }
      });
    }
  }

  private validateActivityReferences(entity: ParsedEntity, errors: ValidationError[]) {
    const activity = entity.frontmatter as any;
    
    // Activities don't need reverse references, but we can check if linked entities exist
    if (activity.deal) {
      let dealPath = activity.deal;
      // Extract path from wikilink format if needed
      if (dealPath.startsWith('[[') && dealPath.endsWith(']]')) {
        dealPath = dealPath.slice(2, -2);
      }
      
      if (!this.entityMap.has(dealPath)) {
        errors.push({
          severity: 'error',
          message: `Referenced deal does not exist: ${activity.deal}`,
          file: entity.filepath
        });
      }
    }
  }

  private isValidWikilinkFormat(link: string): boolean {
    // Should start with entity type folder and contain valid characters
    const validPattern = /^(contacts|companies|opportunities|activities)\/[a-z0-9-]+$/;
    return validPattern.test(link);
  }

  private wikilinkExists(link: string): boolean {
    return this.entityMap.has(link);
  }

  private getRelativePath(filepath: string): string {
    // Convert absolute path to relative path from /crm/
    const crmIndex = filepath.indexOf('/crm/');
    if (crmIndex === -1) return '';
    
    const relativePath = filepath.substring(crmIndex + 5); // Remove '/crm/'
    return relativePath.replace('.md', '');
  }
}