#!/bin/bash

# ================================================
# FOODMAP MADIUN — FEATURE COLLECTOR v3
# ================================================
# SKIP: nothing
# INCLUDE: root configs + semua file src + components/ui
# OUTPUT: collection/collected-features.txt
# ================================================

# ── Colors ──────────────────────────────────────
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

# ── Paths ────────────────────────────────────────
WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$WORKSPACE_ROOT/src"
COLLECTION_DIR="$WORKSPACE_ROOT/collection"
OUT="$COLLECTION_DIR/collected-features.txt"

# ── Counters ─────────────────────────────────────
SKIPPED=0
COLLECTED=0

# ── Init ─────────────────────────────────────────
mkdir -p "$COLLECTION_DIR"

{
    echo "# FOODMAP MADIUN - Source Code Collection"
    echo "# Skip: nothing"
    echo "# Include: root configs + semua file src + components/ui"
    echo ""
    echo "---"
    echo ""
} > "$OUT"

# ── Helpers ──────────────────────────────────────

section() {
    local icon="$1"
    local label="$2"
    echo ""
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${BLUE}${icon} ${label}${NC}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "" >> "$OUT"
    echo "# ${icon} ${label}" >> "$OUT"
    echo "" >> "$OUT"
}

collect_file() {
    local file="$1"
    local rel="${file#$WORKSPACE_ROOT/}"
    local ext="${file##*.}"

    if [ ! -f "$file" ]; then
        echo -e "  ${RED}✗ SKIP${NC} ${YELLOW}(not found)${NC}: $rel"
        SKIPPED=$((SKIPPED + 1))
        return
    fi

    local lines
    lines=$(wc -l < "$file" 2>/dev/null)
    lines="${lines// /}"

    echo -e "  ${GREEN}✓${NC} $rel ${CYAN}(${lines} lines)${NC}"
    COLLECTED=$((COLLECTED + 1))

    echo "" >> "$OUT"
    echo "## \`${rel}\`" >> "$OUT"
    echo "" >> "$OUT"
    echo "**Lines:** ${lines}" >> "$OUT"
    echo "" >> "$OUT"
    echo '```'"${ext}" >> "$OUT"
    cat "$file" >> "$OUT"
    echo "" >> "$OUT"
    echo '```' >> "$OUT"
    echo "" >> "$OUT"
    echo "---" >> "$OUT"
    echo "" >> "$OUT"
}

# ================================================
# ⚙️ ROOT CONFIG
# ================================================
section "⚙️" "ROOT CONFIG"
collect_file "$WORKSPACE_ROOT/package.json"
collect_file "$WORKSPACE_ROOT/next.config.ts"
collect_file "$WORKSPACE_ROOT/tsconfig.json"
collect_file "$WORKSPACE_ROOT/.env.example"
collect_file "$WORKSPACE_ROOT/pnpm-workspace.yaml"

# ================================================
# 📁 APP ROOT
# ================================================
section "📁" "APP ROOT"
collect_file "$SRC/app/layout.tsx"
collect_file "$SRC/app/page.tsx"
collect_file "$SRC/app/globals.css"

# ================================================
# 🔐 LOGIN
# ================================================
section "🔐" "LOGIN"
collect_file "$SRC/app/login/page.tsx"

# ================================================
# 🗺️ PUBLIC — SLUG PAGE
# ================================================
section "🗺️" "PUBLIC — SLUG PAGE"
collect_file "$SRC/app/[slug]/page.tsx"
collect_file "$SRC/app/[slug]/loading.tsx"

# ================================================
# 🏠 ADMIN PAGES
# ================================================
section "🏠" "ADMIN PAGES"
collect_file "$SRC/app/admin/layout.tsx"
collect_file "$SRC/app/admin/page.tsx"
collect_file "$SRC/app/admin/categories/page.tsx"
collect_file "$SRC/app/admin/tenants/page.tsx"
collect_file "$SRC/app/admin/tenants/new/page.tsx"
collect_file "$SRC/app/admin/tenants/[id]/edit/page.tsx"
collect_file "$SRC/app/admin/tenants/[id]/products/page.tsx"

# ================================================
# 🎨 ADMIN COMPONENTS
# ================================================
section "🎨" "ADMIN COMPONENTS"
collect_file "$SRC/components/admin/admin-sidebar.tsx"
collect_file "$SRC/components/admin/admin-topbar.tsx"
collect_file "$SRC/components/admin/category-form.tsx"
collect_file "$SRC/components/admin/cloudinary-upload.tsx"
collect_file "$SRC/components/admin/delete-confirm-dialog.tsx"
collect_file "$SRC/components/admin/location-picker.tsx"
collect_file "$SRC/components/admin/product-form.tsx"
collect_file "$SRC/components/admin/product-table.tsx"
collect_file "$SRC/components/admin/tenant-form.tsx"
collect_file "$SRC/components/admin/tenant-table.tsx"

# ================================================
# 🌐 PUBLIC COMPONENTS
# ================================================
section "🌐" "PUBLIC COMPONENTS"
collect_file "$SRC/components/public/category-filter.tsx"
collect_file "$SRC/components/public/category-tabs.tsx"
collect_file "$SRC/components/public/nearby-button.tsx"
collect_file "$SRC/components/public/tenant-detail-header.tsx"
collect_file "$SRC/components/public/tenant-map-view.tsx"
collect_file "$SRC/components/public/tenant-marker.tsx"
collect_file "$SRC/components/public/tenant-menu-list.tsx"
collect_file "$SRC/components/public/tenant-popup.tsx"
collect_file "$SRC/components/public/wa-cta-button.tsx"

# ================================================
# 🔧 SHARED COMPONENTS
# ================================================
section "🔧" "SHARED COMPONENTS"
collect_file "$SRC/components/shared/empty-state.tsx"
collect_file "$SRC/components/shared/theme-provider.tsx"

# ================================================
# 🎨 COMPONENTS UI (shadcn)
# ================================================
section "🎨" "COMPONENTS UI (shadcn)"
collect_file "$SRC/components/ui/avatar.tsx"
collect_file "$SRC/components/ui/badge.tsx"
collect_file "$SRC/components/ui/button-group.tsx"
collect_file "$SRC/components/ui/button.tsx"
collect_file "$SRC/components/ui/card.tsx"
collect_file "$SRC/components/ui/command.tsx"
collect_file "$SRC/components/ui/dialog.tsx"
collect_file "$SRC/components/ui/dropdown-menu.tsx"
collect_file "$SRC/components/ui/form.tsx"
collect_file "$SRC/components/ui/input-group.tsx"
collect_file "$SRC/components/ui/input.tsx"
collect_file "$SRC/components/ui/label.tsx"
collect_file "$SRC/components/ui/map.tsx"
collect_file "$SRC/components/ui/place-autocomplete.tsx"
collect_file "$SRC/components/ui/select.tsx"
collect_file "$SRC/components/ui/separator.tsx"
collect_file "$SRC/components/ui/sheet.tsx"
collect_file "$SRC/components/ui/skeleton.tsx"
collect_file "$SRC/components/ui/sonner.tsx"
collect_file "$SRC/components/ui/spinner.tsx"
collect_file "$SRC/components/ui/switch.tsx"
collect_file "$SRC/components/ui/table.tsx"
collect_file "$SRC/components/ui/tabs.tsx"
collect_file "$SRC/components/ui/textarea.tsx"
collect_file "$SRC/components/ui/tooltip.tsx"

# ================================================
# 🎣 HOOKS
# ================================================
section "🎣" "HOOKS"
collect_file "$SRC/hooks/use-categories.ts"
collect_file "$SRC/hooks/use-nearby-tenants.ts"
collect_file "$SRC/hooks/use-tenants.ts"

# ================================================
# 🗄️ SUPABASE LIB
# ================================================
section "🗄️" "SUPABASE LIB"
collect_file "$SRC/lib/supabase/client.ts"
collect_file "$SRC/lib/supabase/server.ts"
collect_file "$SRC/lib/supabase/admin.ts"

# ================================================
# ☁️ CLOUDINARY
# ================================================
section "☁️" "CLOUDINARY"
collect_file "$SRC/lib/cloudinary/upload.ts"

# ================================================
# ✅ VALIDATORS
# ================================================
section "✅" "VALIDATORS"
collect_file "$SRC/lib/validators/category.ts"
collect_file "$SRC/lib/validators/product.ts"
collect_file "$SRC/lib/validators/tenant.ts"

# ================================================
# 📚 LIB & UTILS
# ================================================
section "📚" "LIB & UTILS"
collect_file "$SRC/lib/constants.ts"
collect_file "$SRC/lib/format.ts"
collect_file "$SRC/lib/utils.ts"
collect_file "$SRC/lib/wa.ts"

# ================================================
# 📝 TYPES
# ================================================
section "📝" "TYPES"
collect_file "$SRC/types/database.ts"
collect_file "$SRC/types/index.ts"

# ================================================
# 🔀 PROXY
# ================================================
section "🔀" "PROXY"
collect_file "$SRC/proxy.ts"

# ── Summary ──────────────────────────────────────
echo ""
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${GREEN}✅ SELESAI!${NC}"
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}📄 Output    :${NC} $OUT"
echo -e "${CYAN}📝 Lines     :${NC} $(wc -l < "$OUT")"
echo -e "${CYAN}📦 Size      :${NC} $(du -h "$OUT" | cut -f1)"
echo -e "${GREEN}✓  Collected :${NC} $COLLECTED files"
echo -e "${YELLOW}✗  Skipped   :${NC} $SKIPPED files (not found)"
echo ""