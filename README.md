# imlazy-skills

A collection of useful skills for AI coding agents.

## Installation

Use [add-skill](https://github.com/vercel-labs/add-skill) to install skills:

```bash
npx add-skill lazylagom/imlazy-skills
```

Or install a specific skill:

```bash
npx add-skill lazylagom/imlazy-skills --skill gemini-image-watermark-remove
```

## Available Skills

| Skill | Description |
|-------|-------------|
| [gemini-image-watermark-remove](./skills/gemini-image-watermark-remove/SKILL.md) | Remove watermarks from Gemini-generated images |

## Adding New Skills

1. Create a new directory under `skills/`
2. Add a `SKILL.md` file with YAML frontmatter:

```markdown
---
name: your-skill-name
description: Brief description of what the skill does
---

# Your Skill Name

Skill content and instructions here...
```

## License

MIT
