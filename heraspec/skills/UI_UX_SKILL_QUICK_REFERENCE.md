# UI/UX Skill - Quick Reference Guide

Quick guide for creating prompts to build full theme packages with multiple pages using the ui-ux skill.

## 📋 Basic Prompt Template

```
Create a complete website package for [PRODUCT_TYPE] with the following requirements:

**Project Information:**
- Product type: [SaaS / E-commerce / Service / Portfolio / etc.]
- Style: [minimal / elegant / modern / bold / etc.]
- Industry: [Healthcare / Fintech / Beauty / etc.]
- Stack: [html-tailwind / react / nextjs / etc.]
- Pages to create: home, about, [add other pages if needed]

**Process:**
1. Use skill ui-ux to search design intelligence with hybrid mode
2. Create shared components first (Header, Footer, Button, Card)
3. Implement pages in order
4. Ensure consistency in colors, typography, spacing
5. Verify with pre-delivery checklist

**Quality Requirements:**
- ✅ Consistent design system
- ✅ Responsive (320px, 768px, 1024px, 1440px)
- ✅ Accessible (WCAG AA minimum)
- ✅ Performance optimized
```

## 🎯 Specific Prompt Examples

### E-Commerce
```
Create a complete website package for an online fashion store.

Product type: E-commerce Luxury
Style: elegant, premium, sophisticated
Stack: Next.js with Tailwind CSS
Pages: home, about, product category, product details, cart, checkout, thank you, faq, contact

Use skill ui-ux with hybrid mode. Focus on conversion optimization.
```

### SaaS
```
Create a complete website package for a project management SaaS platform.

Product type: SaaS (General)
Style: modern, clean, professional
Stack: React with Tailwind CSS
Pages: home, about, pricing, features, faq, contact, login, register, dashboard

Use skill ui-ux with hybrid mode. Ensure professional and trustworthy.
```

### Service Business
```
Create a complete website package for a healthcare service.

Product type: Beauty & Wellness Service
Style: elegant, minimal, soft, professional
Stack: html-tailwind
Pages: home, about, services, blog listing, post details, category, pricing, faq, contact

Use skill ui-ux with hybrid mode. Focus on trust and credibility.
```

## 🔍 Search Modes

### BM25 (Default)
```bash
python3 heraspec/skills/ui-ux/scripts/search.py "minimalism" --domain style
```
- ✅ Fast, zero dependencies
- ✅ Best for exact keyword matches

### Vector (Semantic)
```bash
python3 heraspec/skills/ui-ux/scripts/search.py "elegant dark theme" --domain style --mode vector
```
- ✅ Understands meaning and synonyms
- ✅ ~15-20% better results
- ⚠️ Requires: `pip install sentence-transformers scikit-learn`

### Hybrid (Best)
```bash
python3 heraspec/skills/ui-ux/scripts/search.py "modern minimal design" --domain style --mode hybrid
```
- ✅ Combines BM25 + Vector
- ✅ ~25% better results
- ⚠️ Requires: `pip install sentence-transformers scikit-learn`

## 📄 Default Page Set

When creating a "complete website package", the default set includes 9 pages:

1. **Home** - Main homepage
2. **About** - Company/story page
3. **Post Details** - Blog/article detail
4. **Category** - Blog/category listing
5. **Pricing** - Pricing plans
6. **FAQ** - Frequently asked questions
7. **Contact** - Contact form
8. **Product Category** - E-commerce category (if applicable)
9. **Product Details** - E-commerce product detail (if applicable)

## 🔧 Search Page Types

```bash
# Home page
python3 heraspec/skills/ui-ux/scripts/search.py "home homepage" --domain pages

# About page
python3 heraspec/skills/ui-ux/scripts/search.py "about company story" --domain pages

# Pricing page
python3 heraspec/skills/ui-ux/scripts/search.py "pricing plans tiers" --domain pages

# E-commerce pages
python3 heraspec/skills/ui-ux/scripts/search.py "product-category shop catalog" --domain pages
python3 heraspec/skills/ui-ux/scripts/search.py "product-detail single-product" --domain pages
```

## 📚 Detailed Documentation

After copying UI/UX skill to your project, see:
- `heraspec/skills/ui-ux/ui-ux-skill.md` - Complete skill documentation
- `heraspec/skills/ui-ux/templates/example-prompt-full-theme.md` - Detailed prompt examples
- `heraspec/skills/ui-ux/templates/prompt-template-full-theme.md` - Copy-paste templates

## 💡 Tips

1. **Always mention "skill ui-ux"** - Agent will know to use this skill
2. **Encourage using hybrid mode** - Best results
3. **List all pages clearly** - Agent knows exact scope
4. **Require consistency** - Ensures unified design system
5. **Mention pre-delivery checklist** - Agent will verify before delivering

## 🚀 Quick Start

1. Copy UI/UX skill to project:
   ```bash
   cp -r /path/to/HeraSpec/src/core/templates/skills/ui-ux-skill.md heraspec/skills/ui-ux/
   cp -r /path/to/HeraSpec/src/core/templates/skills/scripts heraspec/skills/ui-ux/
   cp -r /path/to/HeraSpec/src/core/templates/skills/data heraspec/skills/ui-ux/
   cp -r /path/to/HeraSpec/src/core/templates/skills/templates heraspec/skills/ui-ux/
   ```

2. Use prompt template from above

3. Agent will automatically:
   - Search design intelligence with skill ui-ux
   - Create shared components
   - Implement each page
   - Verify with checklist
