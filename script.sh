#!/bin/bash

# ================================================
# FOODMAP MADIUN — FEATURE COLLECTOR v4
# ================================================
# MODE: public | admin
# USAGE:
#   ./collect-features.sh public
#   ./collect-features.sh admin
# ================================================

# ── Colors ──────────────────────────────────────
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

# ── Mode Selection ───────────────────────────────
MODE="$1"

if [ -z "$MODE" ]; then
    echo ""
    echo -e "${BOLD}${BLUE}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${BLUE}║       FOODMAP MADIUN — FEATURE COLLECTOR v4      ║${NC}"
    echo -e "${BOLD}${BLUE}╚══════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  Pilih mode collect:"
    echo ""
    echo -e "  ${GREEN}[1]${NC} public  — Public pages, public components, hooks, lib, types"
    echo -e "  ${CYAN}[2]${NC} admin   — Admin pages, admin components, hooks, lib, types"
    echo ""
    read -rp "  Masukkan pilihan (1/2) atau ketik 'public'/'admin': " INPUT

    case "$INPUT" in
        1|public) MODE="public" ;;
        2|admin)  MODE="admin"  ;;
        *)
            echo -e "${RED}✗ Pilihan tidak valid. Gunakan: 1, 2, public, atau admin${NC}"
            exit 1
            ;;
    esac
fi

case "$MODE" in
    public|admin) ;;
    *)
        echo -e "${RED}✗ Mode tidak valid: '$MODE'${NC}"
        echo -e "  Usage: $0 [public|admin]"
        exit 1
        ;;
esac

# ── Paths ────────────────────────────────────────
WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$WORKSPACE_ROOT/src"
COLLECTION_DIR="$WORKSPACE_ROOT/collection"
OUT="$COLLECTION_DIR/collected-${MODE}.txt"

# ── Counters ─────────────────────────────────────
SKIPPED=0
COLLECTED=0

# ── Init ─────────────────────────────────────────
mkdir -p "$COLLECTION_DIR"

echo ""
echo -e "${BOLD}${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${BLUE}║       FOODMAP MADIUN — FEATURE COLLECTOR v4      ║${NC}"
echo -e "${BOLD}${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$MODE" = "public" ]; then
    echo -e "  Mode  : ${GREEN}${BOLD}PUBLIC${NC}"
else
    echo -e "  Mode  : ${CYAN}${BOLD}ADMIN${NC}"
fi
echo -e "  Output: ${YELLOW}$OUT${NC}"
echo ""

{
    echo "# FOODMAP MADIUN - Source Code Collection"
    echo "# Mode: ${MODE^^}"
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
# ── SHARED SECTIONS (always collected) ──────────
# ================================================

collect_shared() {
    # ── Root Config ────────────────────────────
    section "⚙️" "ROOT CONFIG"
    collect_file "$WORKSPACE_ROOT/package.json"
    collect_file "$WORKSPACE_ROOT/next.config.ts"
    collect_file "$WORKSPACE_ROOT/tsconfig.json"
    collect_file "$WORKSPACE_ROOT/.env.example"
    collect_file "$WORKSPACE_ROOT/pnpm-workspace.yaml"

    # ── App Root ───────────────────────────────
    section "📁" "APP ROOT"
    collect_file "$SRC/app/layout.tsx"
    collect_file "$SRC/app/page.tsx"
    collect_file "$SRC/app/globals.css"

    # ── Hooks ──────────────────────────────────
    section "🎣" "HOOKS"
    collect_file "$SRC/hooks/use-categories.ts"
    collect_file "$SRC/hooks/use-nearby-tenants.ts"
    collect_file "$SRC/hooks/use-tenants.ts"

    # ── Supabase Lib ───────────────────────────
    section "🗄️" "SUPABASE LIB"
    collect_file "$SRC/lib/supabase/client.ts"
    collect_file "$SRC/lib/supabase/server.ts"
    collect_file "$SRC/lib/supabase/admin.ts"

    # ── Cloudinary ─────────────────────────────
    section "☁️" "CLOUDINARY"
    collect_file "$SRC/lib/cloudinary/upload.ts"

    # ── Validators ─────────────────────────────
    section "✅" "VALIDATORS"
    collect_file "$SRC/lib/validators/category.ts"
    collect_file "$SRC/lib/validators/product.ts"
    collect_file "$SRC/lib/validators/tenant.ts"

    # ── Lib & Utils ────────────────────────────
    section "📚" "LIB & UTILS"
    collect_file "$SRC/lib/constants.ts"
    collect_file "$SRC/lib/format.ts"
    collect_file "$SRC/lib/utils.ts"
    collect_file "$SRC/lib/wa.ts"

    # ── Types ──────────────────────────────────
    section "📝" "TYPES"
    collect_file "$SRC/types/database.ts"
    collect_file "$SRC/types/index.ts"

    # ── Proxy ──────────────────────────────────
    section "🔀" "PROXY"
    collect_file "$SRC/proxy.ts"

    # ── Shared Components ──────────────────────
    section "🔧" "SHARED COMPONENTS"
    collect_file "$SRC/components/shared/empty-state.tsx"
    collect_file "$SRC/components/shared/theme-provider.tsx"

}

# ================================================
# ── PUBLIC MODE ─────────────────────────────────
# ================================================

collect_public() {
    echo -e "${BOLD}${GREEN}🌐 Collecting PUBLIC files...${NC}"
    echo ""

    collect_shared

    # ── Public Pages ───────────────────────────
    section "🗺️" "PUBLIC — SLUG PAGE"
    collect_file "$SRC/app/[slug]/page.tsx"
    collect_file "$SRC/app/[slug]/loading.tsx"

    # ── Public Components ──────────────────────
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
}

# ================================================
# ── ADMIN MODE ──────────────────────────────────
# ================================================

collect_admin() {
    echo -e "${BOLD}${CYAN}🔐 Collecting ADMIN files...${NC}"
    echo ""

    collect_shared

    # ── Login ──────────────────────────────────
    section "🔐" "LOGIN"
    collect_file "$SRC/app/login/page.tsx"

    # ── Admin Pages ────────────────────────────
    section "🏠" "ADMIN PAGES"
    collect_file "$SRC/app/admin/layout.tsx"
    collect_file "$SRC/app/admin/page.tsx"
    collect_file "$SRC/app/admin/categories/page.tsx"
    collect_file "$SRC/app/admin/tenants/page.tsx"
    collect_file "$SRC/app/admin/tenants/new/page.tsx"
    collect_file "$SRC/app/admin/tenants/[id]/edit/page.tsx"
    collect_file "$SRC/app/admin/tenants/[id]/products/page.tsx"

    # ── Admin Components ───────────────────────
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
}

# ── Run ──────────────────────────────────────────
if [ "$MODE" = "public" ]; then
    collect_public
else
    collect_admin
fi

# ── Summary ──────────────────────────────────────
echo ""
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${GREEN}✅ SELESAI! (mode: ${MODE^^})${NC}"
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}📄 Output    :${NC} $OUT"
echo -e "${CYAN}📝 Lines     :${NC} $(wc -l < "$OUT")"
echo -e "${CYAN}📦 Size      :${NC} $(du -h "$OUT" | cut -f1)"
echo -e "${GREEN}✓  Collected :${NC} $COLLECTED files"
echo -e "${YELLOW}✗  Skipped   :${NC} $SKIPPED files (not found)"
echo ""