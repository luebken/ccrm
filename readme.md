# CCRM

A CRM that uses Markdown files with YAML front matter to represent all entities, making it version-controllable, human-readable, and AI-friendly.

> We don't use a CRM anymore. Claude Code runs our CRM.

by [@dexhorthy](https://github.com/dexhorthy). [See Claude for non-code tasks: 🦄 #20
](https://youtu.be/NJcph4j9sNg?si=YBWvuohIFaRvAnJl&t=662). 


## Design Principles

- **Markdown-first datastore**: No database queries needed - AI tools can read files directly
- **YAML front matter**: Structured, deterministic data for reliable parsing
- **Markdown body**: Free-form notes and context with wikilinks
- **Important context first**: Key information at the top since tools like Claude Code prioritize first 100 lines
- **Simple knowledge graph**: Wikilinks create references between entities
- **Process instructions in CLAUDE.md**: Clear guidance for AI interactions
- **Semantic context packing**: Filter by timestamps, priorities and tags to reduce noise
- **Tools**: Deterministic tools like python scripts for editing

## Getting Started

The project contains synthetic sample data under /crm

```bash
git clone git@github.com:luebken/ccrm.git
cd ccrm

claude .

> /lint
> Im Sarah Chen. Which deals require my attention?
```

## Entity Structure

The system manages four core entities under `/crm/`:
- **Contacts**: Individual people (`/contacts/`)
- **Companies**: Organizations (`/companies/`)  
- **Deals**: Revenue opportunities (`/deals/`)
- **Activities**: Interactions and touchpoints (`/activities/`)

All relationships use wikilinks (e.g., `[[companies/acme-corp]]`) for easy navigation and AI understanding.

## Tools & Workflow

Users can freely edit the raw Markdown and use agent tools which work nicely with Markdown files. These agent tools require instructions. We have created an instruction file for [Claude Code](https://www.anthropic.com/claude-code): [CLAUDE.md](CLAUDE.md). 

With Claude you can trigger commands. We currently have implemented `/lint` which ensures data consistency and format compliance. See [tools/linter](tools/linter) and [.claude/commands/lint.md](.claude/commands/lint.md).

### Obsidian

The Markdown/front matter integration works nicely with Markdown-based tools like [Obsidian](https://obsidian.md/).

![obsidian.png](obsidian.png)


## TODO

- [ ] Add AI entity summaries at file beginning
- [ ] Add deterministic context packing example
  - [ ] First 100 lines priority
  - [ ] Tag-based filtering
- [ ] Show Deeper Obsidian integration
- [ ] Add [llm](https://llm.datasette.io/en/stable/) to the AI tooling support