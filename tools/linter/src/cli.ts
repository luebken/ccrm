#!/usr/bin/env node

import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import { CRMLinter } from './linter.js';
import { LinterOptions } from './types/validation.js';
import { ExampleManager } from './utils/examples.js';

const program = new Command();

program
  .name('crm-lint')
  .description('TypeScript linter for markdown-based CRM system')
  .version('1.0.0');

program
  .argument('[path]', 'Path to CRM directory', './crm')
  .option('-v, --verbose', 'Show detailed output including warnings and info')
  .option('-s, --strict', 'Enable strict mode with additional checks')
  .option('--no-wikilinks', 'Skip wikilink cross-reference validation')
  .option('-t, --types <types>', 'Entity types to validate (comma-separated)', 'contacts,companies,deals,activities')
  .action(async (crmPath: string, options) => {
    try {
      // Resolve path
      const resolvedPath = path.resolve(crmPath);
      
      // Check if path exists
      if (!fs.existsSync(resolvedPath)) {
        console.error(`❌ Error: CRM directory not found: ${resolvedPath}`);
        process.exit(1);
      }

      // Check if it's a directory
      if (!fs.statSync(resolvedPath).isDirectory()) {
        console.error(`❌ Error: Path is not a directory: ${resolvedPath}`);
        process.exit(1);
      }

      // Parse entity types
      const entityTypes = options.types.split(',').map((t: string) => t.trim());
      
      // Validate entity types
      const validTypes = ['contacts', 'companies', 'deals', 'activities'];
      const invalidTypes = entityTypes.filter((t: string) => !validTypes.includes(t));
      if (invalidTypes.length > 0) {
        console.error(`❌ Error: Invalid entity types: ${invalidTypes.join(', ')}`);
        console.error(`Valid types: ${validTypes.join(', ')}`);
        process.exit(1);
      }

      // Setup linter options
      const linterOptions: LinterOptions = {
        crmPath: resolvedPath,
        verbose: options.verbose,
        strict: options.strict,
        checkWikilinks: options.wikilinks,
        entityTypes
      };

      console.log('🔍 Starting CRM validation...');
      console.log(`📁 Path: ${resolvedPath}`);
      console.log(`📋 Types: ${entityTypes.join(', ')}`);
      console.log('');

      // Run linter
      const linter = new CRMLinter();
      const result = await linter.lint(linterOptions);

      // Output results
      const output = linter.formatResults(result, options.verbose);
      console.log(output);

      // Exit with appropriate code
      if (result.totalErrors > 0) {
        console.log(`\n❌ Validation failed with ${result.totalErrors} error(s)`);
        process.exit(1);
      } else {
        console.log(`\n✅ Validation passed! All ${result.validFiles} files are valid.`);
        if (result.totalWarnings > 0) {
          console.log(`⚠️  Found ${result.totalWarnings} warning(s) - consider reviewing them.`);
        }
        process.exit(0);
      }

    } catch (error) {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    }
  });

// Add subcommands
program
  .command('init')
  .description('Initialize CRM directory structure')
  .argument('[path]', 'Path to create CRM directory', './crm')
  .action((crmPath: string) => {
    const resolvedPath = path.resolve(crmPath);
    
    try {
      // Create directory structure
      const dirs = ['contacts', 'companies', 'deals', 'activities'];
      
      console.log(`📁 Creating CRM directory structure at: ${resolvedPath}`);
      
      if (!fs.existsSync(resolvedPath)) {
        fs.mkdirSync(resolvedPath, { recursive: true });
      }
      
      dirs.forEach(dir => {
        const dirPath = path.join(resolvedPath, dir);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath);
          console.log(`  ✅ Created: ${dir}/`);
        } else {
          console.log(`  ⏭️  Exists: ${dir}/`);
        }
      });

      // Create README
      const readmePath = path.join(resolvedPath, 'README.md');
      if (!fs.existsSync(readmePath)) {
        const exampleManager = new ExampleManager();
        fs.writeFileSync(readmePath, exampleManager.getReadmeContent());
        console.log(`  ✅ Created: README.md`);
      }

      console.log('\n🎉 CRM directory structure initialized successfully!');
      console.log(`\nNext steps:`);
      console.log(`1. Add your CRM entities to the appropriate directories`);
      console.log(`2. Run 'npx crm-lint' to validate your data`);
      
    } catch (error) {
      console.error('❌ Error creating CRM structure:', error);
      process.exit(1);
    }
  });

program
  .command('example')
  .description('Create example CRM entities')
  .argument('[path]', 'Path to CRM directory', './crm')
  .action((crmPath: string) => {
    const resolvedPath = path.resolve(crmPath);
    
    try {
      const exampleManager = new ExampleManager();
      exampleManager.createExamples(resolvedPath);
      
      console.log('\n🎉 Example CRM entities created successfully!');
      console.log(`\nRun 'npx crm-lint ${crmPath}' to validate the example data.`);
      
    } catch (error) {
      console.error('❌ Error creating example entities:', error);
      process.exit(1);
    }
  });

program
  .command('clean-examples')
  .description('Remove example CRM entities')
  .argument('[path]', 'Path to CRM directory', './crm')
  .option('-f, --force', 'Force removal of modified example files')
  .action((crmPath: string, options) => {
    const resolvedPath = path.resolve(crmPath);
    
    try {
      const exampleManager = new ExampleManager();
      exampleManager.removeExamples(resolvedPath, options.force);
      
      console.log('\n✅ Example cleanup complete!');
      
    } catch (error) {
      console.error('❌ Error removing examples:', error);
      process.exit(1);
    }
  });

program
  .command('list-examples')
  .description('List example files in CRM directory')
  .argument('[path]', 'Path to CRM directory', './crm')
  .action((crmPath: string) => {
    const resolvedPath = path.resolve(crmPath);
    
    try {
      const exampleManager = new ExampleManager();
      exampleManager.listExamples(resolvedPath);
      
    } catch (error) {
      console.error('❌ Error listing examples:', error);
      process.exit(1);
    }
  });

program.parse();