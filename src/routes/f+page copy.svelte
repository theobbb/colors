<script lang="ts">
	import { onMount } from 'svelte';
	import AddColorButton from './add-color-button.svelte';
	import IconClose from '$lib/assets/icons/icon-close.svelte';
	import { palette_modes } from '$lib/assets/palette-modes';
	import Menu from './menu.svelte';
	import type { Color, PaletteMode } from '$lib/color/types';
	import { generate_color, generate_scale, get_middle_color } from '$lib/color/manager';
	import IconCopy from '$lib/assets/icons/icon-copy.svelte';
	import IconMore from '$lib/assets/icons/icon-more.svelte';
	import IconEdit from '$lib/assets/icons/icon-edit.svelte';

	let palette: Color[] = $state([]);

	const scale: {
		color: Color | null;
		shades: Color[];
		param: 'v' | 's' | 'h';
		step_size: number;
		steps: number;
	} = $state({
		color: null,
		shades: [],
		param: 'h',
		step_size: 4,
		steps: 16
	});

	// const config: {
	// 	shades: {
	// 		v: { steps:  }
	// 	}
	// } = $state({})

	let test = $state(4);

	let palette_mode: PaletteMode = $state('none');

	let editing: Color | null = $state(null);

	function generate_palette() {
		const arr = [];

		for (let i = 0; i < 4; i++) {
			const color = generate_color();
			if (!color) continue;
			arr.push(color);
		}
		palette = arr;
		save_palette();
	}

	function set_palette_mode(mode: PaletteMode) {
		if (mode == palette_mode) {
			return;
		}
		palette_mode = mode;
		generate_palette();
	}

	function save_palette() {
		localStorage.setItem('palette', JSON.stringify(palette));
	}

	function load_palette() {
		const saved_palette = localStorage.getItem('palette');

		if (saved_palette) {
			palette = JSON.parse(saved_palette);
			return;
		}
		generate_palette();
	}

	function update_color_name(index: number, value: string) {
		if (palette[index].name == value) return;
		palette[index].name = value;
		save_palette();
	}

	function set_shader(color: Color, param: 'v' | 's' | 'h', step_size: number = 4) {
		scale.color = color;
		scale.param = param;
		scale.step_size = step_size;
		scale.shades = generate_scale(param, color, step_size, 10);
	}

	function replace_color(from: Color, to: Color) {
		const index = palette.indexOf(from);
		if (index == -1) return;
		palette[index] = to;

		if (scale.color == from) {
			scale.color = null;
		}
		save_palette();
	}

	function delete_color(color: Color) {
		palette = palette.filter((c) => c != color);
		save_palette();
	}

	function add_color(index: number) {
		let color1_hex: string;
		let color2_hex: string;

		if (index == 0) {
			color1_hex = '#FFFFFF';
			color2_hex = palette[0]?.hex;
		} else if (index == palette.length) {
			color1_hex = palette[index - 1]?.hex;
			color2_hex = '#000000';
		} else {
			color1_hex = palette[index - 1]?.hex;
			color2_hex = palette[index]?.hex;
		}

		const color = get_middle_color(color1_hex, color2_hex);
		if (!color) {
			console.error('cant add color');
			return;
		}
		palette.splice(index, 0, color);
		save_palette();
	}

	function zoom_in() {
		if (!scale.color) return;

		if (scale.step_size == 1) return;

		console.log('in');
		set_shader(scale.color, scale.param, scale.step_size - 1);
	}
	function zoom_out() {
		if (!scale.color) return;

		if (!scale.shades?.length) return;

		if (scale.param == 'h') {
			const hues = new Set();
			for (const color of scale.shades) {
				if (hues.has(color.h)) {
					return; // duplicate found
				}
				hues.add(color.h);
			}
		} else {
			if (
				scale.shades[0][scale.param] == 0 &&
				scale.shades[scale.shades.length - 1][scale.param] == 100
			)
				return;
		}
		console.log('out');

		set_shader(scale.color, scale.param, scale.step_size + 1);
	}

	function onmousewheel(ev) {
		if (!scale.color) return;
		if (ev.deltaY > 0) {
			zoom_out();
		} else if (ev.deltaY < 0) {
			zoom_in();
		}
	}

	function onkeydown(ev) {
		if (ev.code == 'Space') {
			generate_palette();
		}
	}

	onMount(() => {
		load_palette();

		window.addEventListener('keydown', onkeydown);
		window.addEventListener('wheel', onmousewheel);
		return () => {
			window.removeEventListener('keydown', onkeydown);
			window.removeEventListener('wheel', onmousewheel);
		};
	});

	const sx = {
		button: 'rounded-md bg-white/5 px-2 py-1 hover:bg-white/15'
	};
</script>

<!-- <div class="fixed top-4 left-4 z-1000">
	<div class="flex gap-6 text-sm text-black">
		<div class="flex gap-1 rounded-md bg-white/50 px-1 py-1">
			{#each palette_modes as mode}
				<button
					class={['hover: rounded-md bg-black/5 px-2 py-1 hover:bg-black/15', 'transition']}
					onclick={() => set_palette_mode(mode)}>{mode}</button
				>
			{/each}
		</div>
	</div>
</div> -->

<Menu />
<div class="flex h-screen">
	{#each palette as color, i}
		<div class={['group/color relative h-full flex-1']} style="background-color: {color.hex};">
			{#if i == 0}
				<AddColorButton first onclick={() => add_color(0)} />
			{/if}

			<div class={['pointer-events-none relative z-40 flex h-full items-end']}>
				<div
					class={['pointer-events-auto w-full rounded px-2.5 py-1.5 pb-2']}
					style="background-color: {scale.color == color ? color.hex : 'transparent'}"
				>
					<div class={['space-y-2 pb-4', color.dark && 'invert']}>
						<div>
							<div class="grid grid-cols-3 gap-1">
								{#each ['h', 'v', 's'] as param}
									<button class={sx.button} onclick={() => set_shader(color, param)}>
										{color[param]}
									</button>
								{/each}
							</div>
							<!-- <button class={[sx.button, 'mt-2 flex w-full items-center justify-center gap-1.5']}>
								<span class="col-span-2">{color.hex}</span>
							</button> -->
						</div>

						<div class="space-y-2">
							<input
								onblur={(ev) => update_color_name(i, ev.currentTarget.value)}
								class={[sx.button, 'w-full text-left']}
								type="text"
								value={color.name}
							/>

							<div class="flex items-center justify-between gap-1">
								<button class={[sx.button, '!p-1.5 text-xl']}>
									<IconEdit />
								</button>
								<button class={[sx.button, '!p-1.5 text-xl']}>
									<IconMore />
								</button>
								<button class={[sx.button, '!p-1.5 text-xl']}>
									<IconCopy />
								</button>
								<button onclick={() => delete_color(color)} class={[sx.button, '!p-1.5 text-xl']}>
									<IconClose />
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			{#if i != palette.length - 1}
				<AddColorButton onclick={() => add_color(i + 1)} />
			{:else}
				<AddColorButton last onclick={() => add_color(palette.length)} />
			{/if}
			{#if scale.color == color}
				<div class="absolute inset-0 z-100 flex flex-col">
					{#each scale.shades as shade}
						<div
							onpointerdown={() => replace_color(color, shade)}
							class="group flex w-full flex-1 cursor-pointer items-center justify-center"
							style="background-color: {shade.hex}; color: {shade.l > 22 ? 'black' : 'white'}"
						>
							{#if shade.hex == color.hex}
								<div class="absolute group-hover:opacity-0">●</div>
							{/if}
							<div class="opacity-0 group-hover:opacity-100">
								{shade[scale.param]}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</div>
