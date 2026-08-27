#!/usr/bin/env bash
set -e

# ==============================================================================
# Cekcok Super App - Automated MinIO Deployment Script
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT_DIR"

VERSION=$(node -p "require('./package.json').version")
echo "🚀 Starting build and MinIO deployment for Cekcok Super App v${VERSION}..."

MC_BIN="/opt/homebrew/bin/mc"
if ! command -v "$MC_BIN" &> /dev/null; then
    MC_BIN="mc"
fi

if ! command -v "$MC_BIN" &> /dev/null; then
    echo "❌ MinIO Client (mc) not found. Please install mc or configure PATH."
    exit 1
fi

# Ensure MinIO bucket exists and is public
echo "📦 Ensuring MinIO bucket 'homelab/cekcok-releases' exists..."
$MC_BIN mb --ignore-existing homelab/cekcok-releases
$MC_BIN anonymous set download homelab/cekcok-releases

# Build Tauri application with signing key
KEY_PATH="$ROOT_DIR/src-tauri/cekcok.key"
if [ ! -f "$KEY_PATH" ]; then
    echo "❌ Signing key not found at $KEY_PATH."
    exit 1
fi

export TAURI_SIGNING_PRIVATE_KEY="$(cat "$KEY_PATH")"
export TAURI_SIGNING_PRIVATE_KEY_PATH="$KEY_PATH"
export TAURI_SIGNING_PRIVATE_KEY_PASSWORD=""

echo "🔍 Running linter check..."
npm run lint

echo "🔨 Building Tauri native bundle (macOS DMG & updater artifacts)..."
npm run build
npx tauri build

BUNDLE_DIR="$ROOT_DIR/src-tauri/target/release/bundle"

echo "📤 Uploading build artifacts to MinIO..."

# Upload macOS DMG
DMG_FILE=$(find "$BUNDLE_DIR/dmg" -name "*.dmg" | head -n 1)
if [ -f "$DMG_FILE" ]; then
    DMG_NAME=$(basename "$DMG_FILE")
    echo "Uploading DMG: $DMG_NAME"
    $MC_BIN cp "$DMG_FILE" "homelab/cekcok-releases/$DMG_NAME"
    $MC_BIN cp "$DMG_FILE" "homelab/cekcok-releases/Cekcok-latest-macos.dmg"
fi

# Upload updater artifacts and generate/upload latest.json
MACOS_TAR=$(find "$BUNDLE_DIR/macos" -name "*.tar.gz" 2>/dev/null | head -n 1)
MACOS_SIG=$(find "$BUNDLE_DIR/macos" -name "*.tar.gz.sig" 2>/dev/null | head -n 1)

PUB_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

if [ -f "$MACOS_TAR" ] && [ -f "$MACOS_SIG" ]; then
    TAR_NAME=$(basename "$MACOS_TAR")
    SIG_CONTENT=$(cat "$MACOS_SIG")

    echo "Uploading Updater Archive: $TAR_NAME"
    $MC_BIN cp "$MACOS_TAR" "homelab/cekcok-releases/$TAR_NAME"
    $MC_BIN cp "$MACOS_SIG" "homelab/cekcok-releases/${TAR_NAME}.sig"

    # Architecture detection
    ARCH=$(uname -m)
    PLATFORM_KEY="darwin-x86_64"
    if [ "$ARCH" = "arm64" ]; then
        PLATFORM_KEY="darwin-aarch64"
    fi

    # Generate latest.json
    cat <<EOF > "$ROOT_DIR/src-tauri/target/latest.json"
{
  "version": "${VERSION}",
  "notes": "Cekcok Super App v${VERSION} release: modern app icon, Excel spreadsheet, Word document, drawing whiteboard, and performance improvements.",
  "pub_date": "${PUB_DATE}",
  "platforms": {
    "${PLATFORM_KEY}": {
      "signature": "${SIG_CONTENT}",
      "url": "https://releases.cekcok.my.id/cekcok-releases/${TAR_NAME}"
    }
  }
}
EOF

    echo "Uploading latest.json for auto-updater..."
    $MC_BIN cp "$ROOT_DIR/src-tauri/target/latest.json" "homelab/cekcok-releases/latest.json"
fi

echo "=============================================================================="
echo "✅ Deployment to MinIO Complete!"
echo "🌐 Public Download Base: https://releases.cekcok.my.id/cekcok-releases/"
echo "📥 Latest macOS DMG:     https://releases.cekcok.my.id/cekcok-releases/Cekcok-latest-macos.dmg"
echo "🔄 Updater Endpoint:     https://releases.cekcok.my.id/cekcok-releases/latest.json"
echo "=============================================================================="
