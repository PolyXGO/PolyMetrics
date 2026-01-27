#!/bin/bash

# ========================================
# ICON PROCESSING FOR CHROME EXTENSION
# ========================================

echo ""
echo "🖼️  Processing icons for Chrome Extension..."

# Paths
ICON_INPUT="/Applications/XAMPP/xamppfiles/htdocs/polyxgo/wp-content/chrome_extensions/PolyMetrics/screenshot/icon.png"
ICON_OUTPUT_DIR="/Applications/XAMPP/xamppfiles/htdocs/polyxgo/wp-content/chrome_extensions/PolyMetrics/assets/icons"

# Create output directory if not exists
mkdir -p "$ICON_OUTPUT_DIR"

if [ ! -f "$ICON_INPUT" ]; then
    echo "⚠️  Icon file does not exist: $ICON_INPUT"
    echo "ℹ️  Skipping icon processing..."
    exit 0
else
    echo "🔄 Processing image: $ICON_INPUT"
    
    # Check if ImageMagick is installed
    if ! command -v convert &> /dev/null; then
        echo "❌ ImageMagick is not installed. Please install: brew install imagemagick"
        echo "ℹ️  Skipping icon processing..."
        exit 0
    else
        # Process icon sizes
        SIZES=(16 32 48 128)
        
        for SIZE in "${SIZES[@]}"; do
            ICON_OUTPUT="$ICON_OUTPUT_DIR/icon${SIZE}.png"
            echo "  📐 Creating icon ${SIZE}x${SIZE}..."
            
            # Process high quality image:
            # 1. Remove white background (keep edge details)
            # 2. Resize with high quality filter (Lanczos)
            # 3. Keep metadata and optimize colors
            convert "$ICON_INPUT" \
                -fuzz 5% -transparent white \
                -filter Lanczos \
                -resize ${SIZE}x${SIZE} \
                -define png:compression-filter=5 \
                -define png:compression-level=0 \
                -define png:compression-strategy=1 \
                -quality 100 \
                -strip \
                "$ICON_OUTPUT"
            
            echo "  ✅ Created: icon${SIZE}.png"
        done
        
        echo ""
        echo "✅ Completed! All icons created at: $ICON_OUTPUT_DIR"
        echo "📁 Files: icon16.png, icon32.png, icon48.png, icon128.png"
    fi
fi

