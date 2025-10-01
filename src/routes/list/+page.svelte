<script>
	import { processed_colors } from '$lib/color/manager';

	let colors = $state(processed_colors);

	let current_sort = $state('h');

	function sort(param) {
		if (current_sort == param) {
			colors = processed_colors.sort((b, a) => a[param] - b[param]);
			current_sort = '-' + param;
			return;
		} else colors = processed_colors.sort((a, b) => a[param] - b[param]);

		current_sort = param;
	}
</script>

<div class="fixed top-6 left-6 z-10">
	<div class="flex gap-3 rounded-full bg-white/50 px-3 py-1 text-sm text-black backdrop-blur">
		<button onclick={() => sort('h')}>Hue</button>
		<button onclick={() => sort('v')}>Value</button>
		<button onclick={() => sort('s')}>Saturation</button>
		<button onclick={() => sort('l')}>Lumin</button>
	</div>
</div>

<div class="grid grid-cols-10 text-sm">
	{#each colors as color}
		<div style="background-color: {color.hex}; min-height: 10vw;">
			<div class="px-2 py-1" style="color: {color.l > 22 ? 'black' : 'white'}">
				{color.name}
			</div>
		</div>
	{/each}
</div>
