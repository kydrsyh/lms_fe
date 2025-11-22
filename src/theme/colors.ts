/**
 * Brand Colors Configuration
 *
 * Ubah warna di sini untuk mengganti brand guideline aplikasi.
 * Warna ini akan otomatis diterapkan ke seluruh aplikasi melalui CSS variables.
 */

export const brandColors = {
  // Primary color - warna utama aplikasi
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6", // Main primary color
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
    950: "#172554",
  },

  // Secondary color - warna sekunder
  secondary: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e", // Main secondary color
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
    950: "#052e16",
  },
};

/**
 * Generate CSS variables from brand colors
 */
export const generateCSSVariables = () => {
  const cssVars: Record<string, string> = {};

  Object.entries(brandColors).forEach(([colorName, shades]) => {
    Object.entries(shades).forEach(([shade, value]) => {
      cssVars[`--color-${colorName}-${shade}`] = value;
    });
  });

  return cssVars;
};
