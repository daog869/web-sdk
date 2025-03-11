#!/bin/bash

# Create necessary directories
mkdir -p dist

# Verify TypeScript is installed
if ! [ -x "$(command -v tsc)" ]; then
  echo "Error: TypeScript is not installed. Installing..."
  npm install -g typescript
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run TypeScript compiler
echo "Building TypeScript files..."
npm run build

echo "Build completed successfully!" 