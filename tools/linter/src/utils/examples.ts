import * as fs from 'fs';
import * as path from 'path';

export interface ExampleFile {
  filename: string;
  content: string;
  directory: string;
}

export class ExampleManager {
  private examplesPath: string;

  constructor(basePath: string = __dirname) {
    this.examplesPath = path.join(basePath, '../../examples');
  }

  getExampleFiles(): ExampleFile[] {
    return [
      {
        filename: 'smith-john.md',
        directory: 'contacts',
        content: this.loadTemplate('contact.md')
      },
      {
        filename: 'acme-corp.md',
        directory: 'companies', 
        content: this.loadTemplate('company.md')
      },
      {
        filename: 'acme-2024-q1-expansion.md',
        directory: 'opportunities',
        content: this.loadTemplate('opportunity.md')
      },
      {
        filename: '2024-01-18-14-30-meeting-technical-discovery.md',
        directory: 'activities',
        content: this.loadTemplate('activity.md')
      }
    ];
  }

  getReadmeContent(): string {
    return this.loadTemplate('README.md');
  }

  private loadTemplate(filename: string): string {
    const templatePath = path.join(this.examplesPath, filename);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }
    return fs.readFileSync(templatePath, 'utf8');
  }

  createExamples(crmPath: string): void {
    console.log(`📝 Creating example CRM entities at: ${crmPath}`);
    
    // Ensure directories exist
    const dirs = ['contacts', 'companies', 'deals', 'activities'];
    dirs.forEach(dir => {
      const dirPath = path.join(crmPath, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });

    // Create example files
    const examples = this.getExampleFiles();
    examples.forEach(example => {
      const filePath = path.join(crmPath, example.directory, example.filename);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, example.content);
        console.log(`  ✅ Created: ${example.directory}/${example.filename}`);
      } else {
        console.log(`  ⏭️  Exists: ${example.directory}/${example.filename}`);
      }
    });

    // Create README if it doesn't exist
    const readmePath = path.join(crmPath, 'README.md');
    if (!fs.existsSync(readmePath)) {
      fs.writeFileSync(readmePath, this.getReadmeContent());
      console.log(`  ✅ Created: README.md`);
    } else {
      console.log(`  ⏭️  Exists: README.md`);
    }
  }

  removeExamples(crmPath: string, force: boolean = false): void {
    console.log(`🗑️  Removing example CRM entities from: ${crmPath}`);
    
    const examples = this.getExampleFiles();
    const filesToRemove = [
      ...examples.map(ex => path.join(crmPath, ex.directory, ex.filename)),
      path.join(crmPath, 'README.md')
    ];

    let removedCount = 0;
    let skippedCount = 0;

    filesToRemove.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        if (force || this.isExampleFile(filePath)) {
          try {
            fs.unlinkSync(filePath);
            console.log(`  ✅ Removed: ${path.relative(crmPath, filePath)}`);
            removedCount++;
          } catch (error) {
            console.log(`  ❌ Failed to remove: ${path.relative(crmPath, filePath)} - ${error}`);
          }
        } else {
          console.log(`  ⏭️  Skipped: ${path.relative(crmPath, filePath)} (modified)`);
          skippedCount++;
        }
      }
    });

    console.log(`\n📊 Summary: ${removedCount} removed, ${skippedCount} skipped`);
    
    if (skippedCount > 0 && !force) {
      console.log(`💡 Use --force to remove modified files`);
    }
  }

  private isExampleFile(filePath: string): boolean {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const examples = this.getExampleFiles();
      const readmeContent = this.getReadmeContent();
      
      // Check if content matches any example template
      return examples.some(ex => content.trim() === ex.content.trim()) || 
             content.trim() === readmeContent.trim();
    } catch {
      return false;
    }
  }

  listExamples(crmPath: string): void {
    console.log(`📋 Example files in: ${crmPath}\n`);
    
    const examples = this.getExampleFiles();
    const checkFiles = [
      ...examples.map(ex => ({ path: path.join(crmPath, ex.directory, ex.filename), name: `${ex.directory}/${ex.filename}` })),
      { path: path.join(crmPath, 'README.md'), name: 'README.md' }
    ];

    let foundCount = 0;
    
    checkFiles.forEach(({ path: filePath, name }) => {
      const exists = fs.existsSync(filePath);
      const isExample = exists ? this.isExampleFile(filePath) : false;
      
      if (exists) {
        foundCount++;
        const status = isExample ? '📄 (example)' : '📝 (modified)';
        console.log(`  ${status} ${name}`);
      }
    });
    
    if (foundCount === 0) {
      console.log('  No example files found.');
    } else {
      console.log(`\n📊 Found ${foundCount} files`);
    }
  }
}