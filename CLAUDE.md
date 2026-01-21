# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a skill collection repository for AI coding agents. Skills are installed via the [add-skill](https://github.com/vercel-labs/add-skill) tool:

```bash
npx add-skill raiz/imlazy-skills
npx add-skill raiz/imlazy-skills --skill <skill-name>
```

## Repository Structure

Each skill is a self-contained Node.js package:

```
skills/
  <skill-name>/
    SKILL.md              # Required: skill definition with YAML frontmatter
    package.json          # Node.js package config with bin entry point
    scripts/              # Executable scripts
      *.js                # Main CLI entry point (must have #!/usr/bin/env node)
    assets/               # Optional: supporting files (images, data files, etc.)
    node_modules/         # Dependencies (gitignored typically)
    pnpm-lock.yaml        # Lock file (pnpm is used in this project)
```

## Skill Architecture

Skills follow a consistent pattern:

1. **Executable CLI Tool**: Each skill's main script is an executable Node.js CLI tool
   - Must include shebang: `#!/usr/bin/env node`
   - Defined in `package.json` under `bin` field
   - Can be run via `npx <skill-name>` after installation

2. **SKILL.md Format**: Each skill requires YAML frontmatter with usage documentation:
   ```markdown
   ---
   name: skill-name
   description: Brief description
   ---

   # Skill Title

   ## Quick Start
   ```bash
   npx skill-name [args]
   ```

   ## Usage
   [Command examples and options]

   ## How It Works
   [Technical explanation]
   ```

3. **Asset Management**: Skills can bundle supporting files in `assets/`
   - Access via: `path.join(path.dirname(__dirname), 'assets', 'filename')`
   - Assets are included in npm package via `files` field in package.json

## Adding a New Skill

1. Create directory: `skills/<skill-name>/`
2. Create `package.json` with:
   - Unique package name matching skill name
   - `bin` entry pointing to main executable script
   - `files` array including `scripts` and `assets` directories
   - Dependencies required by the skill
3. Create `scripts/` directory with executable entry point
4. Add `SKILL.md` with YAML frontmatter (name, description) and documentation
5. Add supporting files to `assets/` if needed
6. Install dependencies: `pnpm install` (run from skill directory)
7. Update the skills table in root `README.md`

## Testing Skills

Test a skill locally before publishing:

```bash
# Navigate to skill directory
cd skills/<skill-name>

# Install dependencies
pnpm install

# Test directly
node scripts/<script-name>.js [args]

# Or test as installed package
npx . [args]
```
