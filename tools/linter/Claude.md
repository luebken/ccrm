
## CRM Linter

A TypeScript linter has been implemented to validate the CRM markdown schema and ensure data integrity.

### Features
- **Schema Validation**: Validates all required frontmatter fields and types for each entity
- **Filename Validation**: Ensures proper naming conventions per entity type
- **Wikilink Validation**: Checks wikilink syntax and cross-reference integrity
- **Business Logic**: Validates entity relationships and business rules
- **Cross-Reference Checking**: Ensures bidirectional relationships are maintained

### Location
The linter is located in `tools/linter/` with the following structure:
```
tools/linter/
├── src/
│   ├── types/           # Type definitions for entities and validation
│   ├── parsers/         # Markdown and frontmatter parsing
│   ├── validators/      # Entity-specific validation logic
│   ├── utils/          # Utility functions for filename validation
│   ├── linter.ts       # Main orchestrator
│   └── cli.ts          # Command-line interface
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

### Usage

**Build and setup:**
```bash
make setup    # Install dependencies
make build    # Compile TypeScript
```

**Initialize CRM structure:**
```bash
make init     # Create /crm directory structure
make example  # Add example entities for testing
```

**Validation:**
```bash
make lint           # Validate all CRM entities
make lint-verbose   # Show detailed output with warnings
```

**CLI Commands:**
```bash
# After building
cd tools/linter && node dist/cli.js [path] [options]

# Options:
# --verbose        Show warnings and info messages
# --strict         Enable additional strict checks  
# --no-wikilinks   Skip cross-reference validation
# --types <types>  Validate specific entity types only

# Subcommands:
# init [path]      Initialize CRM directory structure
# example [path]   Create example entities
```

### Validation Rules

**Contacts:**
- Required: first_name, last_name, owner, created_at, updated_at
- Filename: lastname-firstname.md (lowercase, hyphens)
- Email format validation
- Date format validation

**Companies:**
- Required: name, type, owner, created_at, updated_at
- Filename: company-name.md (lowercase, hyphens)
- Type enum: prospect | customer | partner | vendor | other
- Size enum: 1-10 | 11-50 | 51-200 | 201-500 | 501-1000 | 1000+

**Deals:**
- Required: name, stage, company, type, owner, created_at, updated_at
- Filename: company-YYYY-qN-description.md
- Stage enum: lead | qualified | proposal | negotiation | closed-won | closed-lost
- Type enum: new-business | renewal | upsell | cross-sell
- Business logic: closed deals require closed_at date

**Activities:**
- Required: type, subject, date, status, owner, created_at
- Filename: YYYY-MM-DD-HH-MM-type-subject.md
- Type enum: meeting | call | email | note | task
- Status enum: scheduled | completed | cancelled | no-show
- Business logic: meetings/calls should have duration

**Wikilinks:**
- Format validation: [[folder/filename]] syntax
- Cross-reference integrity: bidirectional relationship validation
- Broken link detection: ensures referenced entities exist

### Makefile Targets
- `make help` - Show available commands
- `make dev-setup` - Complete development setup (install, build, init, examples)
- `make validate` - Quick validation of CRM data
- `make install` - Install linter globally as `crm-lint` command
- `make clean` - Remove build artifacts