---
description: Oak / Sparkle release checklist — adapt paths to your repo
alwaysApply: false
---

# Oak Development Guide

**Using this file:** This is a Cursor rule (`.mdc`) checklist for Sparkle-based Mac releases. Save as `.cursor/rules/something.mdc`, replace every `YOUR_PROJECT_ROOT` with your actual app repo path, and trim sections that do not apply to your project.

## Important: When Stuck, Search First
If you encounter unfamiliar errors (especially with Sparkle, code signing, notarization), **use web search immediately** instead of guessing. Many macOS/Sparkle issues have specific documented solutions.

## Project Structure

Two separate repos:
- **App repo**: `YOUR_PROJECT_ROOT/` - macOS app (Swift/SwiftUI)
  - `NotchTest/` - Xcode project root (release.sh, appcast.xml, build/)
  - `NotchTest/NotchTest/` - Source code (Swift files, Info.plist, Assets)
  - Bundle ID: `com.oak.app`
- **Website repo**: `YOUR_PROJECT_ROOT/oak-website/` - Next.js website

## Development Workflow

### Website Changes
- On first change, run `npm run dev` and open http://localhost:3000 in the **system browser** (not Cursor browser)
- Preview changes before committing

### Social Media Preview (OG Image)
The Open Graph image is what shows when sharing links on Twitter/X, Facebook, LinkedIn, etc.
- **Image location**: `oak-website/public/og-image.png`
- **Dimensions**: 1200×630 pixels (required)
- **Metadata**: Configured in `oak-website/src/app/layout.tsx`

To update the OG image:
1. User provides new image (any size)
2. Save/resize to 1200×630 and copy to `public/og-image.png`
3. Commit and push immediately
4. After deploy, test at: https://cards-dev.twitter.com/validator

### App Changes (Debug/Dev Build)
- **Always use debug build for development** - NOT the release app in /Applications
- To build and run debug app:
  ```bash
  pkill Oak 2>/dev/null || true
  cd YOUR_PROJECT_ROOT/NotchTest
  xcodebuild -project NotchTest.xcodeproj -scheme Oak -configuration Debug build -quiet
  BUILD_DIR=$(xcodebuild -project NotchTest.xcodeproj -scheme Oak -showBuildSettings 2>/dev/null | grep "BUILT_PRODUCTS_DIR" | head -1 | awk '{print $3}')
  open "$BUILD_DIR/Oak.app"
  ```

### Debug vs Release Builds
| Type | Location | When to Use |
|---|----|----|
| Debug | Built via terminal, opens from DerivedData | Development, testing code changes |
| Release | `/Applications/Oak.app` | Testing Sparkle updates, final QA |

**Important:** 
- Debug build reflects code changes immediately
- Release build is installed via DMG - code changes won't appear there
- Analytics (PostHog) only runs in Release builds (`#if !DEBUG`)

### Git Policy
- **Website repo**: After completing changes, ask user: "Want me to commit and push?". If user says yes, just do it - don't show diffs or ask for confirmation
- **App repo**: NEVER commit or push unless explicitly asked - always show changes and ask for confirmation first.
- Know which repo you're working in and push to the correct one

## Release Process

Run from the project root (NOT the nested NotchTest/NotchTest source folder):
```bash
cd YOUR_PROJECT_ROOT/NotchTest
./release.sh 1.x.x
```

The `release.sh` script lives at `YOUR_PROJECT_ROOT/NotchTest/release.sh`.

Token is already configured in `~/.zshrc` - no export needed.

### Critical Release Checks (Built into release.sh)

1. **CFBundleVersion must match sparkle:version** - App build number must match appcast
2. **App must NOT be sandboxed** - release.sh verifies:
   - No `SUEnableInstallerLauncherService` in Info.plist (causes "prevented from modifying apps" errors)
   - No `app-sandbox` entitlement in release build
   - No `mach-lookup` entitlements in release build
3. **Use "Install Oak" volume name** for DMG (not just "Oak" - causes permission errors)
4. **Cache-busting params** on download URLs (`?b=BUILD_NUMBER`)

### Testing Sparkle Updates
To test that auto-updates work:
1. Install a release build to `/Applications/Oak.app` (via DMG or `cp -R`)
2. Open the release app (not debug!)
3. Click "Check for Updates"
4. Should show "You're up to date!" or offer update

**Known limitation:** After update installs, Oak may not auto-restart - user may need to reopen manually.

### Common Release Issues & Fixes

| Symptom | Cause | Fix |
|---|----|-----|
| "App already exists" message | Old build cached | Use `--clean` flag |
| Sparkle shows wrong build number | CFBundleVersion mismatch | Script auto-fixes this |
| "Prevented from modifying apps" | Sandbox/XPC config present | Ensure SUEnableInstallerLauncherService is NOT in Info.plist, no sandbox/mach-lookup entitlements |
| Browser serves old DMG | Vercel 30-day cache | Script adds `?b=BUILD` to URLs |
| "Operation not permitted" on DMG | Volume name conflict | Script uses "Install Oak" |
| User has old cached DMG | Browser cache | User needs to clear cache or use incognito |

## App Configuration

### Sparkle (Auto-Updates)
- Feed URL: `https://www.oakfocus.co/appcast.xml`
- Public key in Info.plist: `SUPublicEDKey`
- App is **NOT sandboxed** - uses Sparkle's standard Autoupdate helper (same Developer ID, no App Management prompt)
- Do NOT add `SUEnableInstallerLauncherService` or mach-lookup entitlements (these are for sandboxed apps only and cause "prevented from modifying apps" errors)
- release.sh verifies this automatically and will block the release if sandbox config is detected

### Entitlements (OakRelease.entitlements)
```xml
<key>com.apple.security.network.client</key>
<true/>
```

## Key Files

### Release & Config
| File | Purpose |
|---|---|
| `NotchTest/release.sh` | Automated release script |
| `NotchTest/RELEASE_WORKFLOW.md` | Release documentation |
| `NotchTest/appcast.xml` | Sparkle update feed |
| `NotchTest/NotchTest/Info.plist` | App config including Sparkle settings |
| `NotchTest/OakRelease.entitlements` | Release entitlements (network access only, NOT sandboxed) |

### App Source Code
| File | Purpose |
|---|---|
| `NotchTest/NotchTest/NotchTestApp.swift` | App entry point |
| `NotchTest/NotchTest/ContentView.swift` | Main notch UI |
| `NotchTest/NotchTest/SettingsView.swift` | Settings panel (Usage tab, license activation, etc.) |
| `NotchTest/NotchTest/OnboardingView.swift` | First-run onboarding & license activation |
| `NotchTest/NotchTest/UsageDataManager.swift` | Usage tracking & calendar data |
