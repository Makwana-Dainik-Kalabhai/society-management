#!/bin/bash

# vercel-build.sh
echo "🔨 Starting Vercel build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# List installed packages to verify
echo "✅ Installed packages:"
npm list --depth=0

# Run the build
echo "🚀 Building the application..."
npm run build

echo "✅ Build complete!"