#!/bin/bash

# Script to clean up extension before Chrome Web Store submission
# Run this before creating the ZIP file for submission

echo "🧹 Cleaning up extension for Chrome Web Store submission..."

cd "$(dirname "$0")/PolyMetrics"

# Remove .DS_Store files (macOS)
echo "Removing .DS_Store files..."
find . -name ".DS_Store" -type f -delete

# Remove .git directory if exists
if [ -d ".git" ]; then
    echo "Removing .git directory..."
    rm -rf .git
fi

# Remove .gitignore if exists
if [ -f ".gitignore" ]; then
    echo "Removing .gitignore..."
    rm -f .gitignore
fi

# Remove source maps if any
echo "Removing source maps..."
find . -name "*.map" -type f -delete

# Remove node_modules if exists
if [ -d "node_modules" ]; then
    echo "Removing node_modules..."
    rm -rf node_modules
fi

# Remove README.md from build (keep in source)
if [ -f "README.md" ]; then
    echo "Note: README.md found - you may want to keep it or remove it"
fi

echo "✅ Cleanup complete!"
echo ""
echo "📦 Next steps:"
echo "1. Create ZIP file of the PolyMetrics folder"
echo "2. Upload to Chrome Web Store Developer Dashboard"
echo "3. Fill in store listing information"
echo "4. Add privacy policy URL (if hosted online)"
echo "5. Add screenshots (at least 1 required)"

