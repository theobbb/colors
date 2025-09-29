<script lang="ts">
	import { generate_color, generate_shades, get_middle_color } from '$lib/utils';
	import { onMount } from 'svelte';
	import AddColorButton from './add-color-button.svelte';
	import IconShades from '$lib/assets/icons/icon-shades.svelte';
	import IconClose from '$lib/assets/icons/icon-close.svelte';

	let palette: Color[] = $state([]);

	const shading: {
		color: Color | null;
		shades: Color[];
	} = $state({
		color: null,
		shades: []
	});

	function generate_palette() {
		const arr = [];

		for (let i = 0; i < 4; i++) {
			console.log('ff');
			arr.push(generate_color());
		}
		palette = arr;
		save_palette();
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

	function set_shader(color: Color, type: 'v' | 's' | 'h') {
		shading.color = color;
		shading.shades = generate_shades(type, color, 4, 20);
	}

	function replace_color(from: Color, to: Color) {
		const index = palette.indexOf(from);
		if (index == -1) return;
		palette[index] = to;

		if (shading.color == from) {
			shading.color = null;
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

	function onkeydown(ev) {
		if (ev.code == 'Space') {
			generate_palette();
		}
	}

	onMount(() => {
		load_palette();

		window.addEventListener('keydown', onkeydown);
		return () => {
			window.removeEventListener('keydown', onkeydown);
		};
	});
</script>

<div class="flex h-screen">
	{#each palette as color, i}
		<div class={['group/color relative h-full flex-1']} style="background-color: {color.hex};">
			{#if i == 0}
				<AddColorButton first onclick={() => add_color(0)} />
			{/if}
			<div
				class={[
					'pointer-events-none relative z-40 flex h-full items-end',
					color.l > 22 && 'invert'
				]}
			>
				<div
					class="opacity-0- pointer-events-auto m-2 mr-6 mb-4 w-full rounded px-1 py-0.5 group-hover/color:opacity-100"
				>
					<button
						onclick={() => delete_color(color)}
						class="rounded-lg p-1 text-2xl hover:bg-white/10"
					>
						<IconClose />
					</button>

					<button
						class="rounded-md px-2 py-1 hover:bg-white/10"
						onclick={() => set_shader(color, 'h')}>{color.h}</button
					>
					<button
						class="rounded-md px-2 py-1 hover:bg-white/10"
						onclick={() => set_shader(color, 'v')}>{color.v}</button
					>
					<button
						class="rounded-md px-2 py-1 hover:bg-white/10"
						onclick={() => set_shader(color, 's')}>{color.s}</button
					>
					<div class="text-lg uppercase">{color.hex}</div>
					<div>{color.name}</div>
				</div>
			</div>
			{#if i != palette.length - 1}
				<AddColorButton onclick={() => add_color(i + 1)} />
			{:else}
				<AddColorButton last onclick={() => add_color(palette.length)} />
			{/if}
			{#if shading.color == color}
				<div class="absolute inset-0 z-100 flex flex-col">
					{#each shading.shades as shade}
						<div
							onpointerdown={() => replace_color(color, shade)}
							class="group flex w-full flex-1 cursor-pointer items-center justify-center"
							style="background-color: {shade.hex}; color: {shade.l > 22 ? 'black' : 'white'}"
						>
							{#if shade.hex == color.hex}
								<div class="absolute group-hover:opacity-0">●</div>
							{/if}
							<div class="opacity-0 group-hover:opacity-100">
								{shade.hex}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</div>
