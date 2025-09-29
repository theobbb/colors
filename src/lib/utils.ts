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

function hsv_to_rgb(hsv: HSV) {
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

function component_to_hex(c: number): string {
	const hex = c.toString(16);
	return hex.length === 1 ? '0' + hex : hex;
}

function rgb_to_hex(rgb: RGB): string {
	return '#' + component_to_hex(rgb.r) + component_to_hex(rgb.g) + component_to_hex(rgb.b);
}

function hsv_to_hex(hsv: HSV): string {
	const rgb = hsv_to_rgb(hsv);
	return rgb_to_hex(rgb);
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
		rgb,
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
function calculate_rgb_distance_sq(rgb1: RGB, rgb2: RGB): number {
	const dr = rgb1.r - rgb2.r;
	const dg = rgb1.g - rgb2.g;
	const db = rgb1.b - rgb2.b;
	// Return squared distance to avoid a slow square root operation in the loop
	return dr * dr + dg * dg + db * db;
}

export function get_closest_color_name(rgb: RGB): string | null {
	let min_distance_sq = Infinity;
	let closest_color_name: string | null = null;

	// Iterate through all processed colors to find the minimum distance
	for (const color of processed_colors) {
		// 'color' now includes the pre-calculated 'rgb' object
		// Use the squared distance for comparison speed
		const distance_sq = calculate_rgb_distance_sq(rgb, color.rgb);

		if (distance_sq < min_distance_sq) {
			min_distance_sq = distance_sq;
			closest_color_name = color.name;
		}
	}

	return closest_color_name;
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

export function generate_color(from_hex: string = ''): Color {
	const hex = from_hex
		? from_hex
		: '#' +
			Math.floor(Math.random() * 16777215)
				.toString(16)
				.padStart(6, '0');
	const metrics = get_metrics(hex);
	const color = {
		hex,
		...metrics,
		name: get_closest_color_name(metrics?.rgb)
	};
	return color;
}

export function get_middle_color(hex1: string, hex2: string): Color | null {
	// 1. Convert HEX to RGB
	const rgb1 = hex_to_rgb(hex1);
	const rgb2 = hex_to_rgb(hex2);

	if (!rgb1 || !rgb2) {
		console.error('Invalid HEX code provided to get_middle_color.');
		return null;
	}

	// 2. Calculate the average of each RGB component (Linear Interpolation)
	const middle_rgb: RGB = {
		r: Math.round((rgb1.r + rgb2.r) / 2),
		g: Math.round((rgb1.g + rgb2.g) / 2),
		b: Math.round((rgb1.b + rgb2.b) / 2)
	};

	// 3. Convert the resulting RGB back to a full Color object
	const middle_hex = rgb_to_hex(middle_rgb);
	const color = generate_color(middle_hex); // Use existing generator to get all metrics and name

	// The generate_color function is designed to return the full Color object.
	// However, if the inputs were invalid, it might return null, which is covered
	// by the initial check. Since we constructed a valid RGB, this is safe.
	return color;
}
export function generate_shades(
	param: 'v' | 's' | 'h',
	color: Color,
	step_size: number = 4,
	steps: number = 20
): Color[] {
	const { hex, rgb } = color;

	// Get the base color's HSV metrics
	const base_hsv = rgb_to_hsv(rgb);
	const base_h = base_hsv.h;
	const base_s = base_hsv.s;
	const base_v = base_hsv.v;

	const shades: Color[] = [];

	// Determine which parameter to vary and its constraints
	const base_value = param === 'v' ? base_v : param === 's' ? base_s : base_h;
	const max_value = param === 'h' ? 360 : 100;
	const min_value = 0;

	// --- Generate variants in negative direction ---
	const darker_shades: Color[] = [];
	for (let i = 1; i <= steps; i++) {
		let new_value = base_value - step_size * i;

		// For hue, wrap around the color wheel
		if (param === 'h') {
			new_value = new_value < 0 ? new_value + 360 : new_value;
		} else {
			// Stop if we've reached the minimum for V or S
			if (new_value < min_value) break;
		}

		const new_hsv = {
			h: param === 'h' ? new_value : base_h,
			s: param === 's' ? new_value : base_s,
			v: param === 'v' ? new_value : base_v
		};
		const shade_hex = hsv_to_hex(new_hsv);
		darker_shades.push(generate_color(shade_hex));
	}

	// Reverse so extreme values come first
	darker_shades.reverse();
	shades.push(...darker_shades);

	// --- Add the base color ---
	shades.push(color);

	// --- Generate variants in positive direction ---
	for (let i = 1; i <= steps; i++) {
		let new_value = base_value + step_size * i;

		// For hue, wrap around the color wheel
		if (param === 'h') {
			new_value = new_value >= 360 ? new_value - 360 : new_value;
		} else {
			// Stop if we've reached the maximum for V or S
			if (new_value > max_value) break;
		}

		const new_hsv = {
			h: param === 'h' ? new_value : base_h,
			s: param === 's' ? new_value : base_s,
			v: param === 'v' ? new_value : base_v
		};
		const shade_hex = hsv_to_hex(new_hsv);
		shades.push(generate_color(shade_hex));
	}

	shades.reverse();
	return shades;
}
