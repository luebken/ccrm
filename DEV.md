# DEV.md

This file provides guidance to Claude Code when working on the **development** of this CCRM project itself, not CRM operations.

## Project Overview

CCRM is a markdown-based CRM system designed for AI-native workflows. It uses:
- Markdown files with YAML front matter for data storage
- Wikilinks for entity relationships
- Git for version control
- Python tools for deterministic operations
- Claude Code as the primary interface

## When to Use This File

Use DEV.md (not CLAUDE.md) when:
- Developing new features for the CCRM system
- Writing or modifying tools (linters, validators, scripts)
- Updating documentation (README, CLAUDE.md)
- Working on the project structure itself
- Adding new slash commands
- Improving the AI interaction patterns

Use CLAUDE.md when:
- Managing CRM data (contacts, companies, deals, activities)
- Running day-to-day CRM operations
- Analyzing sales pipeline
- Creating reports from CRM data

## Architecture

### Core Components

**Data Layer** (`/crm/`)
- Markdown files with YAML front matter
- Four entity types: contacts, companies, deals, activities
- Wikilinks for relationships
- Human-readable, git-friendly format

**Tools Layer**
- validate-md skill for data validation and consistency
- Future: importers, exporters, analyzers

**AI Interface** (`CLAUDE.md`, `.claude/commands/`)
- Process instructions for Claude Code
- Custom slash commands
- Context management strategies

### File Structure
```
/
├── CLAUDE.md          # CRM operations instructions
├── DEV.md            # This file - development instructions
├── README.md         # Project documentation
├── .claude/
│   └── commands/     # Slash commands
│       └── lint.md   # Validation command
└── /crm/
    ├── crm.md        # Business context
    ├── /contacts/    # Contact entities
    ├── /companies/   # Company entities
    ├── /deals/       # Deal entities
    └── /activities/  # Activity entities
```

## Development Guidelines

### Code Style
- Python: Follow PEP 8
- Markdown: Use consistent formatting (2 spaces for lists, `---` for front matter delimiters)
- YAML: 2-space indentation, lowercase keys with underscores

### Adding New Features

1. **New Entity Types**
   - Update CLAUDE.md with schema
   - Add folder under `/crm/`
   - Add JSON schema file in the entity folder
   - Update validate-md configuration to validate new type
   - Add examples to synthetic data

2. **New Slash Commands**
   - Create `.claude/commands/command-name.md`
   - Write clear instructions for Claude
   - Test with various inputs
   - Document in README

### Testing Strategy

**Manual Testing**
- Test with synthetic data in `/crm/`
- Verify wikilink integrity
- Check YAML parsing
- Validate git operations

**Schema Validation**
- Run `/validate-md` against all entity types
- Test edge cases (missing fields, invalid data types)
- Verify validation errors are clear and actionable

### Documentation Standards

**CLAUDE.md**
- Focus on CRM operations
- Provide clear schema definitions
- Include examples with wikilinks
- Minimize assumptions principle

**DEV.md** (this file)
- Focus on system development
- Architecture and design decisions
- Development workflows
- Code organization

**README.md**
- User-facing documentation
- Getting started guide
- Feature overview
- Clear separation between CRM use and development

### Design Principles for Development

1. **Deterministic Operations**: Tools should produce consistent results
2. **Idempotent Actions**: Safe to run multiple times
3. **Git-Friendly**: All changes should create clean diffs
4. **AI-Native**: Optimize for AI tool consumption
5. **Human-Readable**: Maintain markdown readability
6. **No Magic**: Explicit over implicit, clear over clever

### Adding Synthetic Test Data

When adding example data:
- Use realistic but fictional names and companies
- Maintain wikilink integrity across entities
- Include edge cases (multiple companies per contact, etc.)
- Follow naming conventions strictly
- Add variety in stages, types, and statuses

### Common Development Tasks

**Update Schema**
1. Modify CLAUDE.md with new fields
2. Update JSON schema files in entity folders
3. Add examples to existing entities
4. Test with `/validate-md`
5. Document in README if user-facing

**Improve AI Instructions**
1. Identify common failure patterns
2. Add explicit guidance to CLAUDE.md or DEV.md
3. Test with various prompts
4. Document edge cases

## Integration Points

### Git Workflow
- Main branch: stable, production-ready
- Feature branches for development
- Commit messages should be clear and descriptive
- Keep commits atomic and focused

### Claude Code Integration
- Use `.claude/commands/` for custom commands
- Keep CLAUDE.md focused and concise
- Provide examples for complex operations
- Test instructions with actual Claude Code sessions

### Future Integrations
- HubSpot sync (via `hubspot_id` fields)
- LLM CLI tool support
- Obsidian plugins
- Export/import tools for other CRM systems

## Performance Considerations

### Context Management
- First 100 lines are prioritized by Claude Code
- Put critical information at top of files
- Use semantic filtering (tags, timestamps) to reduce noise
- Consider file splitting for large entities

### Scaling
- Current design: hundreds of entities per type
- For thousands: consider directory sharding
- For millions: add database layer while maintaining markdown interface

## Contributing

When contributing:
1. Test with synthetic data first
2. Ensure backward compatibility
3. Update relevant documentation
4. Follow existing patterns and conventions
5. Consider AI tool consumption patterns

## Troubleshooting

**Wikilink Issues**
- Verify file naming matches wikilink paths
- Check for typos in entity filenames
- Run `/validate-md` to check data integrity

**YAML Parsing Errors**
- Validate YAML syntax (indentation, colons)
- Check for special characters in values
- Ensure front matter delimiters are correct (`---`)

**Claude Code Behavior**
- Review CLAUDE.md for unclear instructions
- Check if context window is overloaded
- Consider adding more explicit examples
