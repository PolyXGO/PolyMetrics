# Skills Directory

This directory contains reusable skills for HeraSpec projects.

## What Are Skills?

Skills are reusable patterns and workflows that help AI agents implement tasks consistently. Each skill contains:

- **skill.md**: Complete guide on how to use the skill
- **templates/**: Reusable templates
- **scripts/**: Automation scripts
- **examples/**: Good and bad examples

## How Agents Use Skills

When a task has a skill tag:
```markdown
## 1. Feature (projectType: perfex-module, skill: module-codebase)
- [ ] Task 1.1
```

The agent will:
1. Find skill folder: `heraspec/skills/perfex-module/module-codebase/`
2. Read `skill.md` to understand process
3. Use templates and scripts from skill folder
4. Follow guidelines in skill.md

## Available Skills

Run `heraspec skill list` to see all available skills.

## UI/UX Skill - Creating Full Theme Packages

The **UI/UX skill** is particularly useful for creating complete website themes with multiple pages.

### Quick Start

When you need to create a full website package, use prompts like:

```
Tạo gói website đầy đủ cho [PRODUCT_TYPE] với style [STYLE_KEYWORDS].
Sử dụng skill ui-ux với hybrid mode để search design intelligence.
Tạo các trang: home, about, [other pages].
Stack: [html-tailwind/react/nextjs].
Đảm bảo responsive, accessible, consistent design system.
```

### Prompt Templates

For detailed prompt examples and templates, see:
- **Example Prompts**: `heraspec/skills/ui-ux/templates/example-prompt-full-theme.md`
- **Prompt Templates**: `heraspec/skills/ui-ux/templates/prompt-template-full-theme.md`

These templates include:
- Ready-to-use prompts for different website types (E-commerce, SaaS, Service, Blog, Portfolio)
- Step-by-step instructions
- Search command examples
- Best practices

### Search Modes

UI/UX skill supports 3 search modes:
- **BM25 (default)**: Fast keyword-based search, zero dependencies
- **Vector**: Semantic search, ~15-20% better results (requires: `pip install sentence-transformers scikit-learn`)
- **Hybrid**: Best of both, ~25% better results (requires: `pip install sentence-transformers scikit-learn`)

**Usage:**
```bash
# BM25 (default)
python3 heraspec/skills/ui-ux/scripts/search.py "minimalism" --domain style

# Vector (semantic)
python3 heraspec/skills/ui-ux/scripts/search.py "elegant dark theme" --domain style --mode vector

# Hybrid (best)
python3 heraspec/skills/ui-ux/scripts/search.py "modern minimal design" --domain style --mode hybrid
```

### Multi-Page Support

Default page set includes:
1. Home
2. About
3. Post Details
4. Category
5. Pricing
6. FAQ
7. Contact
8. Product Category (e-commerce)
9. Product Details (e-commerce)

Search page types:
```bash
python3 heraspec/skills/ui-ux/scripts/search.py "home homepage" --domain pages
python3 heraspec/skills/ui-ux/scripts/search.py "pricing plans" --domain pages
```

### Adding UI/UX Skill to Your Project

1. Copy skill from HeraSpec core:
   ```bash
   # Copy UI/UX skill
   cp -r /path/to/HeraSpec/src/core/templates/skills/ui-ux-skill.md heraspec/skills/ui-ux/
   cp -r /path/to/HeraSpec/src/core/templates/skills/scripts heraspec/skills/ui-ux/
   cp -r /path/to/HeraSpec/src/core/templates/skills/data heraspec/skills/ui-ux/
   cp -r /path/to/HeraSpec/src/core/templates/skills/templates heraspec/skills/ui-ux/
   ```

2. Or use `heraspec skill add ui-ux` (if available)

3. Read `heraspec/skills/ui-ux/ui-ux-skill.md` for complete documentation

### Flatsome UX Element Skill

Use the **ux-element** skill when developing elements for UX Builder in Flatsome themes.

**Usage:**
```bash
heraspec skill add ux-element --project-type wordpress
```

Read `heraspec/skills/wordpress/ux-element/skill.md` for the **Wrapping Rule** and template usage.

## Creating New Skills

1. Create skill folder structure
2. Write `skill.md` following the template
3. Add templates, scripts, examples as needed

See `docs/SKILLS_STRUCTURE_PROPOSAL.md` for detailed structure.
