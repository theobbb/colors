<script>
	import { generate_color } from '$lib/utils';
	import { onMount } from 'svelte';

	let palette = $state([]);

	function generate_palette() {
		const arr = [];

		for (let i = 0; i < 4; i++) {
			console.log('ff');
			arr.push(generate_color());
		}
		return arr;
	}

	function save_palette() {
		localStorage.setItem('palette', JSON.stringify(palette));
	}

	onMount(() => {
		const saved_palette = localStorage.getItem('palette');
		if (saved_palette) {
			palette = JSON.parse(saved_palette);
			return;
		}
		palette = generate_palette();

		save_palette();
	});

	$inspect(palette);
</script>

<div class="flex h-screen">
	{#each palette as color}
		<div class="h-full flex-1" style="background-color: {color.hex};"></div>
	{/each}
</div>
