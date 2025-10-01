import { raw_colors } from '$lib/assets/raw-colors';
import type { Color, RGB } from './types';
import {
	calculate_rgb_distance_sq,
	get_metrics,
	hex_to_rgb,
	hsv_to_hex,
	rgb_to_hex
} from './utils';

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
	.filter((color) => color != null);

export const is_dark = (l: number) => l > 22;

export function generate_color(from_hex: string = ''): Color | null {
	const hex = from_hex
		? from_hex
		: '#' +
			Math.floor(Math.random() * 16777215)
				.toString(16)
				.padStart(6, '0');
	const metrics = get_metrics(hex);
	if (!metrics) return null;

	const { r, g, b } = metrics;

	const color = {
		hex,
		...metrics,
		name: get_closest_color_name({ r, g, b }),
		dark: is_dark(metrics.l),
		locked: false
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
	if (!middle_hex) return null;
	const color = generate_color(middle_hex);

	return color;
}

export function generate_scale(
	param: 'v' | 's' | 'h',
	color: Color,
	step_size: number,
	steps: number
): Color[] {
	const { h, s, v } = color;
	const base = param === 'v' ? v : param === 's' ? s : h;
	const is_hue = param === 'h';
	const arr: Color[] = [color];
	const seen_hexes = new Set([color.hex.toLowerCase()]);

	const add_color = (offset: number, direction: 'before' | 'after') => {
		let val = base + offset;

		// Handle bounds
		if (is_hue) {
			val = ((val % 360) + 360) % 360;
		} else {
			val = Math.max(0, Math.min(100, val));
		}

		const hsv = {
			h: param === 'h' ? val : h,
			s: param === 's' ? val : s,
			v: param === 'v' ? val : v
		};
		const hex = hsv_to_hex(hsv);
		const new_color = hex ? generate_color(hex) : null;

		if (new_color) {
			direction === 'before' ? arr.unshift(new_color) : arr.push(new_color);
		}
	};

	// Generate backward direction (steps before base)
	for (let i = 1; i <= steps; i++) {
		add_color(-i * step_size, 'before');
	}

	// Generate forward direction (steps after base)
	for (let i = 1; i <= steps; i++) {
		add_color(i * step_size, 'after');
	}

	return arr;
}

export function get_closest_color_name(rgb: RGB): string {
	let min_distance_sq = Infinity;
	let closest_color_name: string = 'Unknown';

	// Iterate through all processed colors to find the minimum distance
	for (const color of processed_colors) {
		const { r, g, b } = color;
		const distance_sq = calculate_rgb_distance_sq(rgb, { r, g, b });

		if (distance_sq < min_distance_sq) {
			min_distance_sq = distance_sq;
			closest_color_name = color.name;
		}
	}

	return closest_color_name;
}
