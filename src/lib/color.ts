/**
 * Generates a hash from a string
 */
function hashString(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}
	return Math.abs(hash);
}

/**
 * Generates a color from a string hash
 */
function generateColorFromHash(hash: number): string {
	// Use the hash to generate RGB values
	const h = hash % 360; // Hue
	const s = 65 + (hash % 20); // Saturation (65-85%)
	const l = 45 + (hash % 15); // Lightness (45-60%)
	
	return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Calculates the relative luminance of an RGB color
 * Used for determining contrast ratio
 */
function getLuminance(r: number, g: number, b: number): number {
	const [rs, gs, bs] = [r, g, b].map((c) => {
		const val = c / 255;
		return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
	});
	return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Converts HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
	s = s / 100;
	l = l / 100;

	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = l - c / 2;

	let r = 0,
		g = 0,
		b = 0;

	if (h >= 0 && h < 60) {
		r = c;
		g = x;
		b = 0;
	} else if (h >= 60 && h < 120) {
		r = x;
		g = c;
		b = 0;
	} else if (h >= 120 && h < 180) {
		r = 0;
		g = c;
		b = x;
	} else if (h >= 180 && h < 240) {
		r = 0;
		g = x;
		b = c;
	} else if (h >= 240 && h < 300) {
		r = x;
		g = 0;
		b = c;
	} else if (h >= 300 && h < 360) {
		r = c;
		g = 0;
		b = x;
	}

	return [
		Math.round((r + m) * 255),
		Math.round((g + m) * 255),
		Math.round((b + m) * 255),
	];
}

/**
 * Determines if a color needs light or dark text for contrast
 */
function getContrastTextColor(bgColor: string): string {
	// Parse HSL color
	const hslMatch = bgColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
	if (!hslMatch) return "#000000";

	const h = parseInt(hslMatch[1]);
	const s = parseInt(hslMatch[2]);
	const l = parseInt(hslMatch[3]);

	const [r, g, b] = hslToRgb(h, s, l);
	const luminance = getLuminance(r, g, b);

	// WCAG recommends 0.179 as the threshold
	return luminance > 0.179 ? "#000000" : "#FFFFFF";
}

/**
 * Generates a color from text with good contrast against a given background
 * @param text - The text to hash for color generation
 * @param backgroundColor - The background color (default: white)
 * @returns Object with backgroundColor and textColor properties
 */
export function generateContrastColor(
	text: string,
): {
	backgroundColor: string;
	textColor: string;
} {
	const hash = hashString(text);
	const bgColor = generateColorFromHash(hash);
	const textColor = getContrastTextColor(bgColor);

	return {
		backgroundColor: bgColor,
		textColor,
	};
}

/**
 * Generates just the background color from text
 * @param text - The text to hash
 * @returns HSL color string
 */
export function getColorFromText(text: string): string {
	const hash = hashString(text);
	return generateColorFromHash(hash);
}
