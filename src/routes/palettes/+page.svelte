<script lang="ts">
	import { load_palettes, type Palette } from '$lib/palettes.svelte';
	import { onMount } from 'svelte';

	let palettes: Palette[] = $state([]);

	onMount(() => {
		palettes = load_palettes();
	});
</script>

<div>
	<button>New Palette</button>
	{#each palettes as palette}
		<div>{palette.name}</div>
		<div>{palette.created_at}</div>
		<div>{palette.name}</div>
		<div class="flex h-24 w-64">
			{#each palette.colors as color}
				<div class=" h-24 w-full flex-1" style=" background-color: {color.hex};"></div>
			{/each}
		</div>
	{/each}
</div>
