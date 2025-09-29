import { raw_colors } from './assets/raw-colors';

function hex_to_rgb(hex: string) {
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

function rgb_to_hsv(rgb: RGB) {
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

function calculateLuminance(rgb: RGB) {
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
function get_metrics(hex: string) {
	const rgb = hex_to_rgb(hex);

	if (!rgb) {
		console.error(`Invalid Hex code provided: ${hex}`);
		return null;
	}

	const hsv = rgb_to_hsv(rgb);
	const luminance = calculateLuminance(rgb);

	return {
		hex: hex,
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

export const processed_colors = raw_colors
	.map((color) => {
		const metrics = get_metrics(color.hex);
		return metrics
			? {
					...color,
					...metrics
				}
			: null;
	})
	.filter((color) => color);

export function generate_color() {
	const hex =
		'#' +
		Math.floor(Math.random() * 16777215)
			.toString(16)
			.padStart(6, '0');
	const metrics = get_metrics(hex);
	const color = {
		hex,
		...metrics
	};
	return color;
}
