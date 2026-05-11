"use client"

/**
 * Custom cluster icon untuk MapMarkerClusterGroup.
 *
 * Style konsisten dengan TenantMarker label (pill putih + border amber),
 * tapi ukurannya lebih gede + bold count number biar grouping kelihatan
 * sebagai "kelompok" bukan "1 warung dengan angka aneh".
 */
export function TenantClusterIcon({ count }: { count: number }) {
  // Scale up size berdasarkan count — visual hierarchy
  const size = count < 10 ? 36 : count < 100 ? 42 : 48
  const fontSize = count < 10 ? 14 : count < 100 ? 15 : 16

  return (
    <div
      style={{
        position: "relative",
        transform: "translate(-50%, -50%)",
        pointerEvents: "auto",
      }}
    >
      {/* Soft halo ring (decoration) */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: size + 10,
          height: size + 10,
          marginLeft: -(size + 10) / 2,
          marginTop: -(size + 10) / 2,
          borderRadius: "50%",
          background: "rgba(245, 158, 11, 0.18)", // amber-500 @ 18%
        }}
      />

      {/* Main pill */}
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          background: "#ffffff",
          border: "2px solid #f59e0b", // amber-500
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#92400e", // amber-800
          fontSize,
          fontWeight: 700,
          lineHeight: 1,
          boxShadow: "0 3px 10px rgba(0, 0, 0, 0.18)",
          fontFamily: "var(--font-sans), system-ui, sans-serif",
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {count}
      </div>
    </div>
  )
}
