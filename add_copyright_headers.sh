#!/bin/bash

# Create a temporary file with the new license header
cat > /tmp/new_license_header.txt << 'EOL'
/*
 * MIT No Attribution
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
EOL

# Find all TypeScript and TSX files, excluding node_modules
find /Users/willsia/Development/GP_IVR_chatbot_migration_to_AmazonLex_Connect -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "*/node_modules/*" | while read file; do
  # Check if the file has a license header
  if grep -q "Copyright Amazon.com" "$file"; then
    # Create a temporary file
    temp_file=$(mktemp)
    
    # Extract the content after the license header
    awk 'BEGIN{found=0} /\*\//{if(!found){found=1; next}} found{print}' "$file" > "$temp_file"
    
    # Combine the new license header with the content
    cat /tmp/new_license_header.txt "$temp_file" > "$file"
    
    # Clean up
    rm "$temp_file"
    
    echo "Updated license in $file"
  fi
done

# Clean up
rm /tmp/new_license_header.txt

echo "License replacement complete!"
