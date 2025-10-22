# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a general-purpose CRM system that uses Markdown files with YAML front matter to represent all entities, making it version-controllable, human-readable, and AI-friendly. 

The system uses wikilinks for all entity relationships.

## Core Instructions

* Minimize assumptions. Back all recomendations on the CRM data.

## Tools

### Dependencies

* To install Python packages always use `uv`
* To install Node packages always use `pnpm`

## Core Entities

Contacts, Companies, Deals, Activities

All entities are stored under `/crm/` as Markdown files with YAML front matter:

### Contacts (`/crm/contacts/`)
**Purpose**: Individual people who are customers, prospects, or any business relationship

- **File naming**: `lastname-firstname.md` (e.g., `smith-john.md`)
- **Front matter fields**:
  - `hubspot_id`: Unique identifier (optional, for HubSpot integration)
  - `first_name`: First name
  - `last_name`: Last name
  - `email`: Email address
  - `phone`: Phone number
  - `title`: Job title
  - `company`: Primary company wikilink (e.g., `[[companies/acme-corp]]`)
  - `companies`: Array of company wikilinks for multiple affiliations
  - `deals`: Array of deal wikilinks
  - `owner`: Owner name (e.g., "Sarah Chen")
  - `tags`: Array of tags
  - `created_at`: Creation date
  - `updated_at`: Last modified date
  - `last_contacted`: Date of last interaction
- **Markdown body**: Notes, communication preferences, background information with wikilinks to related entities

### Companies (`/crm/companies/`)
**Purpose**: Organizations and businesses

- **File naming**: `company-name.md` (e.g., `acme-corp.md`)
- **Front matter fields**:
  - `hubspot_id`: Unique identifier (optional, for HubSpot integration)
  - `name`: Company name
  - `domain`: Primary domain/website
  - `industry`: Industry sector
  - `size`: Employee count range (1-10, 11-50, 51-200, 201-500, 501-1000, 1000+)
  - `revenue`: Annual revenue range
  - `type`: prospect | customer | partner | vendor | other
  - `contacts`: Array of contact wikilinks
  - `deals`: Array of deal wikilinks
  - `owner`: Owner name
  - `phone`: Main phone number
  - `address`: Company address
  - `tags`: Array of tags
  - `created_at`: Creation date
  - `updated_at`: Last modified date
- **Markdown body**: Company description, notes, key information with wikilinks

### Deals (`/crm/deals/`)
**Purpose**: Revenue opportunities and sales pipeline

- **File naming**: `company-YYYY-qN-description.md` (e.g., `acme-2024-q1-expansion.md`)
- **Front matter fields**:
  - `hubspot_id`: Unique identifier (optional, for HubSpot integration)
  - `name`: Deal name
  - `stage`: lead | qualified | proposal | negotiation | closed-won | closed-lost
  - `amount`: Deal value
  - `probability`: Win probability (0-100)
  - `expected_close_date`: Projected close date
  - `company`: Company wikilink (one company per deal)
  - `contacts`: Array of contact wikilinks
  - `primary_contact`: Main contact wikilink
  - `owner`: Owner name
  - `type`: new-business | renewal | upsell | cross-sell
  - `tags`: Array of tags
  - `created_at`: Creation date
  - `updated_at`: Last modified date
  - `closed_at`: Actual close date (if closed)
  - `lost_reason`: Reason if lost (competitor | budget | timing | other)
- **Markdown body**: Deal details, notes, requirements, next steps with wikilinks

### Activities (`/crm/activities/`)
**Purpose**: Interactions and touchpoints with contacts and companies

- **File naming**: `YYYY-MM-DD-HH-MM-type-subject.md` (e.g., `2024-03-15-14-30-meeting-quarterly-review.md`)
- **Front matter fields**:
  - `hubspot_id`: Unique identifier (optional, for HubSpot integration)
  - `type`: meeting | call | email | note | task
  - `subject`: Activity title
  - `date`: Activity date/time
  - `duration`: Duration in minutes (for meetings/calls)
  - `status`: scheduled | completed | cancelled | no-show
  - `contacts`: Array of contact wikilinks
  - `company`: Company wikilink
  - `deal`: Deal wikilink (if applicable)
  - `owner`: Owner name
  - `outcome`: Brief outcome summary
  - `next_action`: Follow-up action needed
  - `tags`: Array of tags
  - `created_at`: Creation date
- **Markdown body**: Detailed notes, action items, discussion points with wikilinks

## Wikilinks Usage

### Wikilink Format
- Use `[[filename]]` to link to any entity
- Full paths: `[[companies/acme-corp]]` or `[[contacts/smith-john]]`
- Display text: `[[companies/acme-corp|Acme]]` shows as "Acme"

### Linking to Headings
- Link to specific sections: `[[companies/acme-corp#Key Contacts]]`
- Multiple levels: `[[deals/acme-2024-q1-expansion#Details#Pricing]]`

### Link Examples in Markdown Body
```markdown
Met with [[contacts/smith-john|John Smith]] from [[companies/acme-corp]] to discuss 
the [[deals/acme-2024-q1-expansion|expansion deal]]. 

Key points discussed:
- Budget approved by [[contacts/jones-mary|Mary Jones]] (CFO)
- Implementation timeline for Q2
- Follow-up meeting scheduled with technical team

Next steps: Schedule demo with [[contacts/wilson-emma|Emma Wilson]] from their IT department.
```
## Relationship Model

### Association Structure
All relationships use wikilinks instead of IDs:
- Two-way associations maintained through wikilinks
- Front matter contains wikilink arrays for relationships
- Markdown body uses inline wikilinks for context

### Key Relationships

**Contacts ↔ Companies**
- Many-to-many via wikilink arrays
- Primary company in `company` field
- All affiliations in `companies` array

**Deals ↔ Companies**
- Many-to-one: Each deal has one `company` wikilink
- Companies list deals in `deals` array

**Deals ↔ Contacts**
- Many-to-many via `contacts` array
- `primary_contact` for main stakeholder

**Activities ↔ All Entities**
- Link to any combination via wikilinks
- Creates complete interaction history

### Ownership Model
- Every entity has an `owner` field with the owner's name
- Simple string format (e.g., "Sarah Chen")
- Ownership transfers by updating the owner name

## File Structure
```
/crm/
├── crm.md           # CRM schema & business context
├── /contacts/        # Individual people
├── /companies/       # Organizations
├── /deals/          # Opportunities
└── /activities/     # Interactions
```

## CRM Schema & Context

### Schema File (`/crm/crm.md`)
**Purpose**: Provides business context and metadata about this CRM instance

- **Content**: Free-form markdown describing:
  - Company/organization details and business model
  - Industry focus and target market
  - CRM users, roles, and responsibilities
  - Key business metrics and goals
  - System integrations and data governance
  - Usage guidelines and best practices
- **No front matter required**: Pure markdown content for maximum flexibility
- **Usage**: Reference document for understanding CRM context and business requirements
- **Audience**: AI assistants, new team members, and stakeholders needing CRM context

## Working with the System

### Creating New Entities
1. Create file with proper naming convention
2. Add required front matter fields
3. Use wikilinks for all relationships
4. Set owner name
5. Add contextual notes with inline wikilinks

### Wikilink Best Practices
- Always use relative paths from `/crm/`
- Include folder name for clarity: `[[contacts/smith-john]]`
- Use aliases for readability: `[[companies/acme-corp|Acme]]`
- Avoid special characters in filenames: `# | ^ : %% [[ ]]`

