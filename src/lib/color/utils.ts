import type { ColorMetric, HEX, HSV, RGB } from './types';

export function hex_to_rgb(hex: string): RGB | null {
	// Remove the hash if it exists
	const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function (m, r, g, b) {
		return r + r + g + g + b + b;
	});

	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			}
		: null;
}

export function rgb_to_hsv(rgb: RGB): HSV {
	const r = rgb.r / 255;
	const g = rgb.g / 255;
	const b = rgb.b / 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const delta = max - min;

	let h = 0,
		s = 0,
		v = max;

	// Calculate Saturation (S)
	s = max === 0 ? 0 : delta / max;

	// Calculate Hue (H)
	if (delta !== 0) {
		switch (max) {
			case r:
				h = (g - b) / delta + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / delta + 2;
				break;
			case b:
				h = (r - g) / delta + 4;
				break;
		}
		h *= 60;
	}

	return {
		// Hue is a degree (0-360)
		h: Math.round(h),
		// Saturation (0-100)
		s: Math.round(s * 100),
		// Value/Brightness (0-100) - used for Lightness sorting
		v: Math.round(v * 100)
	};
}

export function hsv_to_rgb(hsv: HSV) {
	const h = hsv.h;
	const s = hsv.s / 100; // Normalize S to 0-1
	const v = hsv.v / 100; // Normalize V to 0-1

	let r = 0,
		g = 0,
		b = 0;

	// Chroma, X, and Match Value calculation for conversion
	const c = v * s;
	const hPrime = h / 60;
	const x = c * (1 - Math.abs((hPrime % 2) - 1));
	const m = v - c;

	if (hPrime >= 0 && hPrime < 1) {
		r = c;
		g = x;
		b = 0;
	} else if (hPrime >= 1 && hPrime < 2) {
		r = x;
		g = c;
		b = 0;
	} else if (hPrime >= 2 && hPrime < 3) {
		r = 0;
		g = c;
		b = x;
	} else if (hPrime >= 3 && hPrime < 4) {
		r = 0;
		g = x;
		b = c;
	} else if (hPrime >= 4 && hPrime < 5) {
		r = x;
		g = 0;
		b = c;
	} else if (hPrime >= 5 && hPrime < 6) {
		r = c;
		g = 0;
		b = x;
	}

	// Add match value and scale to 0-255
	r = Math.round((r + m) * 255);
	g = Math.round((g + m) * 255);
	b = Math.round((b + m) * 255);

	return { r, g, b };
}

export function component_to_hex(c: number): string {
	const hex = c.toString(16);
	return hex.length === 1 ? '0' + hex : hex;
}

export function rgb_to_hex(rgb: RGB): HEX | null {
	const hex = '#' + component_to_hex(rgb.r) + component_to_hex(rgb.g) + component_to_hex(rgb.b);
	if (!is_valid_hex(hex)) return null;
	return hex;
}

export function hsv_to_hex(hsv: HSV): HEX | null {
	const rgb = hsv_to_rgb(hsv);
	return rgb_to_hex(rgb);
}

export function calculate_luminance(rgb: RGB): number {
	// 1. Normalize RGB to 0-1 range and apply sRGB transfer function (gamma correction)
	// The coefficients below are chosen to represent the relative luminance
	// of the red, green, and blue primary colors.
	const R = rgb.r / 255;
	const G = rgb.g / 255;
	const B = rgb.b / 255;

	const transform = (c: number) => {
		if (c <= 0.03928) {
			return c / 12.92;
		} else {
			return Math.pow((c + 0.055) / 1.055, 2.4);
		}
	};

	const r_linear = transform(R);
	const g_linear = transform(G);
	const b_linear = transform(B);

	// 2. Calculate relative luminance
	// Formula: L = 0.2126 * R_linear + 0.7152 * G_linear + 0.0722 * B_linear
	const luminance = 0.2126 * r_linear + 0.7152 * g_linear + 0.0722 * b_linear;

	// Return a value between 0 and 100 for easier sorting/comparison.
	return Math.round(luminance * 100);
}

export function get_metrics(hex: string): ColorMetric | null {
	const rgb = hex_to_rgb(hex);

	if (!rgb) {
		console.error(`Invalid Hex code provided: ${hex}`);
		return null;
	}

	const hsv = rgb_to_hsv(rgb);
	const luminance = calculate_luminance(rgb);

	return {
		...rgb,
		// H: Hue (0-360) - for primary color sorting
		h: hsv.h,
		// S: Saturation (0-100) - for vibrancy sorting
		s: hsv.s,
		// V: Value/Brightness (0-100) - for lightness sorting
		v: hsv.v,
		// L: Relative Luminance (0-100) - for accessibility/perceived brightness sorting
		l: luminance
	};
}

// Helper function to calculate the squared Euclidean distance between two RGB colors
export function calculate_rgb_distance_sq(rgb1: RGB, rgb2: RGB): number {
	const dr = rgb1.r - rgb2.r;
	const dg = rgb1.g - rgb2.g;
	const db = rgb1.b - rgb2.b;
	// Return squared distance to avoid a slow square root operation in the loop
	return dr * dr + dg * dg + db * db;
}

export function is_valid_hex(value: string): value is HEX {
	return /^#?([a-f\d]{3}){1,2}$/i.test(value);
}
