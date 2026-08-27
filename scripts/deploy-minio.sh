#!/usr/bin/env bash
set -e

# ==============================================================================
# Cekcok Super App - Multi-Platform MinIO Deployment Script (macOS & Windows)
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

echo "🔨 Building Tauri native bundle & updater artifacts..."
npm run build
npx tauri build

BUNDLE_DIR="$ROOT_DIR/src-tauri/target/release/bundle"

echo "📤 Uploading build artifacts to MinIO..."

# Download existing latest.json if available to preserve multi-platform manifests
TEMP_MANIFEST="$ROOT_DIR/src-tauri/target/latest.json"
$MC_BIN cp homelab/cekcok-releases/latest.json "$TEMP_MANIFEST" 2>/dev/null || echo "{}" > "$TEMP_MANIFEST"

# Determine Release Notes / Changelog (Priority: RELEASE_NOTES.md -> env var -> git commit)
NOTES_FILE="$ROOT_DIR/RELEASE_NOTES.md"
if [ -f "$NOTES_FILE" ]; then
    export RELEASE_NOTES="$(cat "$NOTES_FILE")"
elif [ -z "$RELEASE_NOTES" ]; then
    LATEST_COMMIT_MSG=$(git log -1 --pretty=%B 2>/dev/null | head -n 3 | tr '\n' ' ' | sed 's/"/\\"/g')
    export RELEASE_NOTES="Cekcok Super App v${VERSION}: ${LATEST_COMMIT_MSG}"
fi
echo "📝 Release Notes loaded from ${NOTES_FILE}"

PUB_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# 1. Handle macOS DMG & Updater Bundle
if [ -d "$BUNDLE_DIR/dmg" ] || [ -d "$BUNDLE_DIR/macos" ]; then
    DMG_FILE=$(find "$BUNDLE_DIR/dmg" -name "*.dmg" 2>/dev/null | head -n 1)
    if [ -n "$DMG_FILE" ] && [ -f "$DMG_FILE" ]; then
        DMG_NAME=$(basename "$DMG_FILE")
        echo "Uploading macOS DMG: $DMG_NAME"
        $MC_BIN cp "$DMG_FILE" "homelab/cekcok-releases/$DMG_NAME"
        $MC_BIN cp "$DMG_FILE" "homelab/cekcok-releases/Cekcok-latest-macos.dmg"
    fi

    MACOS_TAR=$(find "$BUNDLE_DIR/macos" -name "*.tar.gz" 2>/dev/null | head -n 1)
    MACOS_SIG=$(find "$BUNDLE_DIR/macos" -name "*.tar.gz.sig" 2>/dev/null | head -n 1)

    if [ -n "$MACOS_TAR" ] && [ -f "$MACOS_TAR" ] && [ -n "$MACOS_SIG" ] && [ -f "$MACOS_SIG" ]; then
        TAR_NAME=$(basename "$MACOS_TAR")
        SIG_CONTENT=$(cat "$MACOS_SIG")

        echo "Uploading macOS Updater Archive: $TAR_NAME"
        $MC_BIN cp "$MACOS_TAR" "homelab/cekcok-releases/$TAR_NAME"
        $MC_BIN cp "$MACOS_SIG" "homelab/cekcok-releases/${TAR_NAME}.sig"

        ARCH=$(uname -m)
        PLATFORM_KEY="darwin-x86_64"
        if [ "$ARCH" = "arm64" ]; then
            PLATFORM_KEY="darwin-aarch64"
        fi

        node -e "
        const fs = require('fs');
        const p = '$TEMP_MANIFEST';
        let data = {};
        try { data = JSON.parse(fs.readFileSync(p, 'utf8')); } catch(e){}
        data.version = '$VERSION';
        data.notes = process.env.RELEASE_NOTES || 'Cekcok Super App v$VERSION release with Macan Cisewu mascot and multi-workspace support.';
        data.pub_date = '$PUB_DATE';
        data.platforms = data.platforms || {};
        data.platforms['$PLATFORM_KEY'] = {
            signature: '$SIG_CONTENT',
            url: 'https://releases.cekcok.my.id/cekcok-releases/$TAR_NAME'
        };
        fs.writeFileSync(p, JSON.stringify(data, null, 2));
        "
    fi
fi

# 2. Handle Windows NSIS / MSI & Updater Bundle
if [ -d "$BUNDLE_DIR/nsis" ] || [ -d "$BUNDLE_DIR/msi" ]; then
    EXE_FILE=$(find "$BUNDLE_DIR/nsis" -name "*.exe" 2>/dev/null | head -n 1)
    if [ -n "$EXE_FILE" ] && [ -f "$EXE_FILE" ]; then
        EXE_NAME=$(basename "$EXE_FILE")
        echo "Uploading Windows EXE: $EXE_NAME"
        $MC_BIN cp "$EXE_FILE" "homelab/cekcok-releases/$EXE_NAME"
        $MC_BIN cp "$EXE_FILE" "homelab/cekcok-releases/Cekcok-latest-windows.exe"
    fi

    MSI_FILE=$(find "$BUNDLE_DIR/msi" -name "*.msi" 2>/dev/null | head -n 1)
    if [ -n "$MSI_FILE" ] && [ -f "$MSI_FILE" ]; then
        MSI_NAME=$(basename "$MSI_FILE")
        echo "Uploading Windows MSI: $MSI_NAME"
        $MC_BIN cp "$MSI_FILE" "homelab/cekcok-releases/$MSI_NAME"
        $MC_BIN cp "$MSI_FILE" "homelab/cekcok-releases/Cekcok-latest-windows.msi"
    fi

    WIN_ZIP=$(find "$BUNDLE_DIR/nsis" -name "*.nsis.zip" 2>/dev/null | head -n 1)
    WIN_SIG=$(find "$BUNDLE_DIR/nsis" -name "*.nsis.zip.sig" 2>/dev/null | head -n 1)

    if [ -n "$WIN_ZIP" ] && [ -f "$WIN_ZIP" ] && [ -n "$WIN_SIG" ] && [ -f "$WIN_SIG" ]; then
        ZIP_NAME=$(basename "$WIN_ZIP")
        WIN_SIG_CONTENT=$(cat "$WIN_SIG")

        echo "Uploading Windows Updater Archive: $ZIP_NAME"
        $MC_BIN cp "$WIN_ZIP" "homelab/cekcok-releases/$ZIP_NAME"
        $MC_BIN cp "$WIN_SIG" "homelab/cekcok-releases/${ZIP_NAME}.sig"

        node -e "
        const fs = require('fs');
        const p = '$TEMP_MANIFEST';
        let data = {};
        try { data = JSON.parse(fs.readFileSync(p, 'utf8')); } catch(e){}
        data.version = '$VERSION';
        data.notes = process.env.RELEASE_NOTES || 'Cekcok Super App v$VERSION release with Macan Cisewu mascot and multi-workspace support.';
        data.pub_date = '$PUB_DATE';
        data.platforms = data.platforms || {};
        data.platforms['windows-x86_64'] = {
            signature: '$WIN_SIG_CONTENT',
            url: 'https://releases.cekcok.my.id/cekcok-releases/$ZIP_NAME'
        };
        fs.writeFileSync(p, JSON.stringify(data, null, 2));
        "
    fi
fi

if [ -f "$TEMP_MANIFEST" ]; then
    echo "Uploading latest.json for auto-updater..."
    $MC_BIN cp "$TEMP_MANIFEST" "homelab/cekcok-releases/latest.json"
fi

echo "=============================================================================="
echo "✅ Deployment to MinIO Complete!"
echo "🌐 Public Download Base:   https://releases.cekcok.my.id/cekcok-releases/"
echo "📥 Latest macOS DMG:       https://releases.cekcok.my.id/cekcok-releases/Cekcok-latest-macos.dmg"
echo "📥 Latest Windows EXE/MSI: https://releases.cekcok.my.id/cekcok-releases/Cekcok-latest-windows.exe"
echo "🔄 Updater Endpoint:       https://releases.cekcok.my.id/cekcok-releases/latest.json"
echo "=============================================================================="

