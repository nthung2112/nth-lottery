// Determine whether the color is rgb or rgba
export function isRgbOrRgba(color: string) {
  return color.indexOf("rgb") > -1 || color.indexOf("rgba") > -1;
}

// Determine whether the color is hex
export function isHex(color: string) {
  return color.indexOf("#") > -1;
}

// Convert hex color to rgb
export function hexToRgba(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return { r, g, b };
}
// Convert rgb array to r g b values
export function rgbToRgba(rgb: string) {
  const rgbArr = rgb.split("(")[1].split(")")[0].split(",");

  return { r: rgbArr[0], g: rgbArr[1], b: rgbArr[2] };
}

// Compose rgb color with opacity
export function rgba(color: string, opacity: number) {
  opacity = opacity || 1;
  // Determine whether the color is hex
  if (isHex(color)) {
    const { r, g, b } = hexToRgba(color);
    return `rgba(${r},${g},${b},${opacity})`;
  } else {
    const { r, g, b } = rgbToRgba(color);
    return `rgba(${r},${g},${b},${opacity})`;
  }
}

export function rgbToHex(color: string) {
  // Remove spaces from the string
  color = color.replace(/\s+/g, "");

  // Match rgba or rgb format string
  const rgbaMatch = color.match(/^rgba?\((\d+),(\d+),(\d+),?(\d*\.?\d+)?\)$/i);
  if (!rgbaMatch) {
    throw new Error("Invalid color format");
  }

  const r = parseInt(rgbaMatch[1], 10);
  const g = parseInt(rgbaMatch[2], 10);
  const b = parseInt(rgbaMatch[3], 10);
  const a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : undefined;

  // Convert RGB values to hexadecimal
  let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();

  // If an alpha value is provided, convert it to hexadecimal and append it to the result
  if (a !== undefined) {
    let alphaHex = Math.round(a * 255)
      .toString(16)
      .toUpperCase();
    if (alphaHex.length === 1) {
      alphaHex = `0${alphaHex}`; // Ensure alpha value is two digits
    }
    hex += alphaHex;
  }

  return hex;
}
