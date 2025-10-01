import { generate_color, rgb_to_hsv, hsv_to_hex } from './utils';

export function generate_palette(palette: Color[], mode: PaletteMode): Color[] {
	// 1. Start with the locked colors and remove them from the total size count
	const lockedHexes = new Set(lockedColors.map((c) => c.hex));
	palette = lockedColors;
	let colorsNeeded = paletteSize - palette.length;

	if (colorsNeeded <= 0 && mode !== 'none') {
		// If the number of locked colors already meets or exceeds the required size,
		// and the mode is not 'none', simply return the locked colors (truncated if needed).
		return palette.slice(0, paletteSize);
	}

	// Helper to create a Color object and ensure it's not already in the palette
	const addColor = (hsv: HSV) => {
		const hex = hsv_to_hex(hsv);
		if (!lockedHexes.has(hex)) {
			palette.push(generate_color(hex));
			colorsNeeded--;
		}
	};

	// 2. Generate the required colors based on the harmony mode
	switch (mode) {
		case 'none':
			// The 'none' mode simply returns the base color and any locked colors.
			if (!lockedHexes.has(baseColor.hex)) {
				palette.push(baseColor);
				colorsNeeded--;
			}
			// Fill any remaining space with random colors if paletteSize > 1
			for (let i = 0; colorsNeeded > 0 && i < paletteSize * 2; i++) {
				// Max iterations to prevent infinite loop
				const randomColor = generate_color();
				if (!lockedHexes.has(randomColor.hex) && !palette.find((c) => c.hex === randomColor.hex)) {
					palette.push(randomColor);
					colorsNeeded--;
				}
			}
			break;

		case 'monochromatic':
			// Monochromatic: Vary V (Value/Brightness) and S (Saturation) while keeping H (Hue) constant.
			// Use the base color as the anchor point.
			// Defaulting to 4 colors for a nice spread, then filling the rest with variations.
			const steps = 4;
			const s_step = (100 - baseS) / steps;
			const v_step = (100 - baseV) / steps;

			// Brighter and more saturated (towards white/lighter shade)
			for (let i = 1; colorsNeeded > 0 && i <= steps; i++) {
				addColor({
					h: baseH,
					s: Math.max(0, baseS - s_step * i), // Decrease saturation
					v: Math.min(100, baseV + v_step * i) // Increase value
				});
			}

			// Darker and less saturated (towards black/darker shade)
			for (let i = 1; colorsNeeded > 0 && i <= steps; i++) {
				addColor({
					h: baseH,
					s: Math.max(0, baseS + s_step * i * 0.5), // Increase saturation slightly
					v: Math.max(0, baseV - v_step * i) // Decrease value
				});
			}

			// Add base color if it wasn't locked
			if (!lockedHexes.has(baseColor.hex) && !palette.includes(baseColor)) {
				palette.push(baseColor);
				colorsNeeded--;
			}

			break;

		case 'complementary':
			// Complementary: Base color and the color directly across the color wheel (180 degrees).
			if (!lockedHexes.has(baseColor.hex) && !palette.includes(baseColor)) {
				palette.push(baseColor);
				colorsNeeded--;
			}
			const complementaryH = (baseH + 180) % 360;
			if (colorsNeeded > 0) {
				addColor({ h: complementaryH, s: baseS, v: baseV });
			}
			break;

		case 'analogous':
			// Analogous: Colors adjacent to the base color on the wheel (e.g., +/- 30 degrees).
			const degrees_analogous = 30;
			if (!lockedHexes.has(baseColor.hex) && !palette.includes(baseColor)) {
				palette.push(baseColor);
				colorsNeeded--;
			}

			// Determine the number of colors to generate on each side
			const halfColors = Math.floor(colorsNeeded / 2);
			const remainingColors = colorsNeeded - halfColors * 2;

			// Negative (counter-clockwise)
			for (let i = 1; i <= halfColors; i++) {
				const offset = degrees_analogous * i;
				let newH = (baseH - offset) % 360;
				newH = newH < 0 ? newH + 360 : newH;
				addColor({ h: newH, s: baseS, v: baseV });
			}

			// Positive (clockwise)
			for (let i = 1; i <= halfColors + remainingColors; i++) {
				const offset = degrees_analogous * i;
				const newH = (baseH + offset) % 360;
				addColor({ h: newH, s: baseS, v: baseV });
			}
			break;

		case 'triad':
			// Triadic: Three colors evenly spaced around the color wheel (120 degrees apart).
			if (!lockedHexes.has(baseColor.hex) && !palette.includes(baseColor)) {
				palette.push(baseColor);
				colorsNeeded--;
			}
			const h2 = (baseH + 120) % 360;
			const h3 = (baseH + 240) % 360;

			if (colorsNeeded > 0) addColor({ h: h2, s: baseS, v: baseV });
			if (colorsNeeded > 0) addColor({ h: h3, s: baseS, v: baseV });
			break;

		case 'split_complementary':
			// Split Complementary: Base color and the two colors adjacent to its complement (180 +/- 30 degrees).
			if (!lockedHexes.has(baseColor.hex) && !palette.includes(baseColor)) {
				palette.push(baseColor);
				colorsNeeded--;
			}
			const h_comp = (baseH + 180) % 360;
			const h_split1 = (h_comp - 30) % 360;
			const h_split2 = (h_comp + 30) % 360;
			const split1 = h_split1 < 0 ? h_split1 + 360 : h_split1;
			const split2 = h_split2 >= 360 ? h_split2 - 360 : h_split2;

			if (colorsNeeded > 0) addColor({ h: split1, s: baseS, v: baseV });
			if (colorsNeeded > 0) addColor({ h: split2, s: baseS, v: baseV });
			break;

		case 'square':
			// Square: Four colors equally spaced around the color wheel (90 degrees apart).
			if (!lockedHexes.has(baseColor.hex) && !palette.includes(baseColor)) {
				palette.push(baseColor);
				colorsNeeded--;
			}
			const h_s1 = (baseH + 90) % 360;
			const h_s2 = (baseH + 180) % 360;
			const h_s3 = (baseH + 270) % 360;

			if (colorsNeeded > 0) addColor({ h: h_s1, s: baseS, v: baseV });
			if (colorsNeeded > 0) addColor({ h: h_s2, s: baseS, v: baseV });
			if (colorsNeeded > 0) addColor({ h: h_s3, s: baseS, v: baseV });
			break;

		case 'compound':
			// Compound (Tetradic): Four colors arranged into two complementary pairs (e.g., 0, 60, 180, 240).
			// Use two adjacent colors and their complements.
			if (!lockedHexes.has(baseColor.hex) && !palette.includes(baseColor)) {
				palette.push(baseColor);
				colorsNeeded--;
			}
			const h_c2 = (baseH + 30) % 360; // 30 degrees offset
			const h_c3 = (baseH + 180) % 360; // Complement of base
			const h_c4 = (baseH + 210) % 360; // Complement of c2

			if (colorsNeeded > 0) addColor({ h: h_c2, s: baseS, v: baseV });
			if (colorsNeeded > 0) addColor({ h: h_c3, s: baseS, v: baseV });
			if (colorsNeeded > 0) addColor({ h: h_c4, s: baseS, v: baseV });
			break;

		case 'shades':
			// Shades: Uses the imported generate_shades function (assuming it's available).
			// Prioritize 'v' (Value/Brightness) for generating shades/tints.
			// The `generate_shades` function needs to be imported or defined. Since it's in your provided script,
			// it's assumed to be available. We'll use a larger step size to get the required number of colors.
			const max_steps_single_direction = Math.ceil((paletteSize - palette.length - 1) / 2);
			const v_step_size = Math.max(1, Math.floor(100 / (max_steps_single_direction * 2)));

			// Use the existing generate_shades logic but re-implement to respect locked colors and size
			// or assume generate_shades is available and manually filter.
			// Re-implementing simplified logic here for a clean solution:

			// Fill remaining space with varying V values
			const max_v_diff = Math.min(baseV, 100 - baseV);
			const current_v_step = max_v_diff / max_steps_single_direction;

			// Darker (lower V)
			for (let i = 1; colorsNeeded > 0 && i <= max_steps_single_direction; i++) {
				const new_v = Math.max(0, baseV - current_v_step * i);
				addColor({ h: baseH, s: baseS, v: new_v });
			}

			// Lighter (higher V)
			for (let i = 1; colorsNeeded > 0 && i <= max_steps_single_direction; i++) {
				const new_v = Math.min(100, baseV + current_v_step * i);
				addColor({ h: baseH, s: baseS, v: new_v });
			}

			// Add base color if it wasn't locked
			if (!lockedHexes.has(baseColor.hex) && !palette.includes(baseColor)) {
				palette.push(baseColor);
				colorsNeeded--;
			}
			break;
	}

	// 3. Final steps: Remove duplicates and truncate/fill to match the palette size
	const finalPalette = Array.from(new Set(palette.map((c) => c.hex)))
		.map((hex) => palette.find((c) => c.hex === hex)!) // Re-map back to Color object
		.slice(0, paletteSize);

	// If the palette is still smaller than paletteSize (e.g., not enough V/S/H space or due to locked colors),
	// add the base color first, then fill with random colors.
	if (finalPalette.length < paletteSize) {
		const baseHex = baseColor.hex;
		if (!finalPalette.find((c) => c.hex === baseHex)) {
			finalPalette.push(baseColor);
		}

		while (finalPalette.length < paletteSize) {
			const randomColor = generate_color();
			if (!finalPalette.find((c) => c.hex === randomColor.hex)) {
				finalPalette.push(randomColor);
			}
		}
	}

	return finalPalette;
}
