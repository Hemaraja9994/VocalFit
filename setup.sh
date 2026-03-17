#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# VocalFit — One-Click Setup Script
# Run this inside the VocalFit folder: bash setup.sh
# ═══════════════════════════════════════════════════════════════

set -e

echo ""
echo "🎙  VocalFit Setup"
echo "══════════════════════════════════════"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo ""
    echo "Please install Node.js first:"
    echo "  → Go to https://nodejs.org"
    echo "  → Download the LTS version"
    echo "  → Install it (just click Next through the installer)"
    echo "  → Then run this script again"
    echo ""
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js found: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. It should come with Node.js."
    exit 1
fi
echo "✅ npm found: $(npm -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies (this takes 1-2 minutes)..."
echo ""
npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ npm install failed. Try running:"
    echo "   npm install --legacy-peer-deps"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "══════════════════════════════════════"
echo "🚀 Starting VocalFit..."
echo ""
echo "A QR code will appear below."
echo "Scan it with your phone to open the app:"
echo "  → iPhone: Open the Camera app and point at the QR code"
echo "  → Android: Open the Expo Go app and tap 'Scan QR code'"
echo ""
echo "First time? Install 'Expo Go' from your app store first."
echo "══════════════════════════════════════"
echo ""

npx expo start
