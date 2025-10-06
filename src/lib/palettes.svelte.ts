import { generate_color } from './color/manager';
import type { Color } from './color/types';

export type Palette = {
	id: string;
	name: string;
	colors: Color[];
	status: string;
	updated_at: number;
	created_at: number;
};

export const PALETTE: { list: string[]; current: Palette | null } = $state({
	list: [],
	current: null
});

let palette_loaded = false;

export function load_palette() {
	if (palette_loaded) return;
	const saved_palette_id = localStorage.getItem('palette_id');

	if (!saved_palette_id) return create_palette();

	const saved_palette_json = localStorage.getItem(saved_palette_id);
	if (!saved_palette_json) return create_palette();

	const saved_palette = JSON.parse(saved_palette_json) as Palette;

	PALETTE.current = saved_palette;
	palette_loaded = true;
}

let palettes_loaded = false;
export function load_palettes() {
	if (palettes_loaded) return;
	const saved_palettes_ids_json = localStorage.getItem('palette_ids');

	if (!saved_palettes_ids_json) return [];

	const saved_palette_ids = JSON.parse(saved_palettes_ids_json) as string[];
	if (!saved_palette_ids?.length) return [];

	const palettes: Palette[] = saved_palette_ids
		.map((id) => {
			const saved_palette_json = localStorage.getItem(id);
			if (!saved_palette_json) return null;
			const palette = JSON.parse(saved_palette_json);
			return palette;
		})
		.filter((p): p is Palette => p !== null);
	palettes_loaded = true;
	return palettes;
}

export function create_palette() {
	const colors: Color[] = generate_palette_colors();

	const palette = {
		id: crypto.randomUUID(),
		name: '',
		colors,
		status: 'draft',
		created_at: Date.now(),
		updated_at: Date.now()
	};

	localStorage.setItem('palette_id', palette.id);
	save_palette(palette);
	push_palette_id(palette.id);

	PALETTE.current = palette;
}
function push_palette_id(id: string) {
	let palette_ids: string[] = [];

	const palettes_json = localStorage.getItem('palette_ids');

	if (palettes_json) {
		palette_ids = JSON.parse(palettes_json) as string[];
		palette_ids.push(id);
	} else {
		palette_ids = [id];
	}
	localStorage.setItem('palette_ids', JSON.stringify(palette_ids));

	PALETTE.list.push(id);
}

export function generate_palette_colors(): Color[] {
	const colors = [];

	for (let i = 0; i < 6; i++) {
		const color = generate_color();
		if (!color) continue;
		colors.push(color);
	}

	return colors;
}

export function save_palette(palette: Palette) {
	localStorage.setItem(palette.id, JSON.stringify(palette));
}
