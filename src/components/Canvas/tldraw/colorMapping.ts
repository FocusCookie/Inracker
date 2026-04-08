const HEX_TO_TLDRAW_COLOR: Record<string, string> = {
  "#ffffff": "white",
  "#f44336": "red",
  "#ff9800": "orange",
  "#ffc107": "orange",
  "#ffeb3b": "yellow",
  "#cddc39": "light-green",
  "#4caf50": "green",
  "#10b981": "green",
  "#009688": "blue",
  "#00bcd4": "light-blue",
  "#0ea5e9": "light-blue",
  "#2196f3": "blue",
  "#3f51b5": "blue",
  "#8b5cf6": "violet",
  "#9c27b0": "violet",
  "#d946ef": "violet",
  "#e91e63": "red",
  "#f43f5e": "red",
  "#64748b": "grey",
  "#9e9e9e": "grey",
  "#000000": "black",
};

const TLDRAW_TO_HEX_COLOR = Object.entries(HEX_TO_TLDRAW_COLOR).reduce<Record<string, string>>(
  (acc, [hex, tldrawColor]) => {
    if (!acc[tldrawColor]) {
      acc[tldrawColor] = hex;
    }
    return acc;
  },
  {},
);

export function hexToTldrawColor(color: string | undefined): string {
  if (!color) return "black";
  const normalized = color.toLowerCase();
  return HEX_TO_TLDRAW_COLOR[normalized] || "black";
}

export function tldrawToHexColor(color: string | undefined): string {
  if (!color) return "#000000";
  if (color.startsWith("#")) return color.toLowerCase();
  return TLDRAW_TO_HEX_COLOR[color] || "#000000";
}
