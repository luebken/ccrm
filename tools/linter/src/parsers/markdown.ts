import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { Entity, EntityType, ParsedEntity } from '../types/entities.js';

export class MarkdownParser {
  parseFile(filepath: string): ParsedEntity | null {
    try {
      const content = fs.readFileSync(filepath, 'utf8');
      const { data: frontmatter, content: markdownContent } = matter(content);
      
      const filename = path.basename(filepath, '.md');
      const entityType = this.detectEntityType(filepath);
      
      if (!entityType) {
        return null;
      }

      return {
        type: entityType,
        filename,
        frontmatter: frontmatter as Entity,
        content: markdownContent,
        filepath
      };
    } catch (error) {
      console.error(`Error parsing file ${filepath}:`, error);
      return null;
    }
  }

  private detectEntityType(filepath: string): EntityType | null {
    const pathParts = filepath.split(path.sep);
    
    if (pathParts.includes('contacts')) return 'contact';
    if (pathParts.includes('companies')) return 'company';
    if (pathParts.includes('opportunities')) return 'opportunity';
    if (pathParts.includes('activities')) return 'activity';
    
    return null;
  }

  extractWikilinks(content: string): string[] {
    const wikilinkRegex = /\[\[([^\]|]+)(\|[^\]]+)?\]\]/g;
    const matches = [];
    let match;
    
    while ((match = wikilinkRegex.exec(content)) !== null) {
      matches.push(match[1]);
    }
    
    return matches;
  }

  extractWikilinksFromFrontmatter(frontmatter: any): string[] {
    const links: string[] = [];
    
    const processValue = (value: any) => {
      if (typeof value === 'string' && value.startsWith('[[') && value.endsWith(']]')) {
        const link = value.slice(2, -2).split('|')[0];
        links.push(link);
      } else if (Array.isArray(value)) {
        value.forEach(processValue);
      } else if (typeof value === 'object' && value !== null) {
        Object.values(value).forEach(processValue);
      }
    };

    Object.values(frontmatter).forEach(processValue);
    return links;
  }
}