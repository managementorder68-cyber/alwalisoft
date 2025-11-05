#!/bin/bash
# Fix all ctx.redis usage to check if Redis is available

cd /workspace/bot

# Find all files with ctx.redis and add null check
find . -name "*.ts" -type f | while read file; do
    # Skip if already has the check
    if ! grep -q "if (ctx.redis)" "$file" 2>/dev/null; then
        # Check if file has ctx.redis usage
        if grep -q "ctx\.redis\." "$file" 2>/dev/null; then
            echo "File may need manual fix: $file"
        fi
    fi
done

echo "Done checking files"
