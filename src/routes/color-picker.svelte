<script>
	import { generate_shades } from '$lib/color/utils';

	const { color, replace_color } = $props();

	const params = $derived.by(() => {
		const h = generate_shades('h', color, 4, 20);
		const v = generate_shades('v', color, 4, 20);
		const s = generate_shades('s', color, 4, 20);

		return [h, v, s];
	});
</script>

<div class="absolute inset-0 z-100 flex flex-col">
	{#each params as param}
		<div class="flex">
			{#each param as c}
				<div
					onpointerdown={() => replace_color(color, c)}
					class="group flex w-full flex-1 cursor-pointer items-center justify-center"
					style="background-color: {c.hex}; color: {c.l > 22 ? 'black' : 'white'}"
				>
					{#if c.hex == color.hex}
						<div class="absolute group-hover:opacity-0">●</div>
					{/if}
					<div class="opacity-0 group-hover:opacity-100">
						{c.hex}
					</div>
				</div>
			{/each}
		</div>
	{/each}
</div>
