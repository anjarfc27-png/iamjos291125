"use client";

// Pusat konfigurasi theme iamJOS yang meniru OJS PKP 3.3

export const pkpColors = {
  headerBg: "#002C40",
  sidebarBg: "#002C40",
  sidebarText: "#ffffff",
  pageBg: "#eaedee",
  contentBg: "#ffffff",
  primary: "#006798",
  primaryDark: "#005a82",
  borderSubtle: "#e5e5e5",
  textMain: "#1f2937",
  textMuted: "rgba(0, 0, 0, 0.54)",
  // Additional OJS 3.3 colors
  pageHeaderBg: "#E5E5E5",
  textGray: "#666666",
  textDark: "#111827",
  linkBlue: "#006798",
  titleDark: "#002C40",
};

// Typography - OJS 3.3 Standard
export const pkpTypography = {
  fontFamily: '"Noto Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
  // Font sizes
  pageTitle: "1.25rem",      // 20px - Page H1
  sectionTitle: "1.5rem",    // 24px - Section H2
  subsectionTitle: "1.125rem", // 18px - H3
  bodyLarge: "1rem",         // 16px
  bodyRegular: "0.9375rem",  // 15px - Default links/text
  bodySmall: "0.875rem",     // 14px
  caption: "0.75rem",        // 12px
  // Font weights
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};

// Spacing - OJS 3.3 Standard
export const pkpSpacing = {
  xs: "0.25rem",    // 4px
  sm: "0.5rem",     // 8px
  md: "1rem",       // 16px
  lg: "1.5rem",     // 24px
  xl: "2rem",       // 32px
  xxl: "2.5rem",    // 40px
};
