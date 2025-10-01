export type HEX = `#${string}`;

export type RGB = {
	r: number;
	g: number;
	b: number;
};
export type HSV = {
	h: number;
	s: number;
	v: number;
};

export type ColorMetric = RGB & HSV & { l: number };

export type Color = ColorMetric & {
	name: string;
	locked: boolean;
	dark: boolean;

	hex: string;
};
export type PaletteMode =
	| 'none'
	| 'analogous'
	| 'monochromatic'
	| 'triad'
	| 'complementary'
	| 'split_complementary'
	| 'square'
	| 'compound'
	| 'shades';
