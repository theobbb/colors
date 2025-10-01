<script lang="ts">
	import IconHistory from '$lib/assets/icons/icon-history.svelte';
	import IconImage from '$lib/assets/icons/icon-image.svelte';
	import IconInfo from '$lib/assets/icons/icon-info.svelte';
	import IconMenu from '$lib/assets/icons/icon-menu.svelte';
	import IconOpen from '$lib/assets/icons/icon-open.svelte';
	import IconSave from '$lib/assets/icons/icon-save.svelte';
	import { onMount } from 'svelte';

	let open = $state(false);

	function set_state(state: boolean) {
		open = state;
		localStorage.setItem('menu-open', String(state));
	}

	const options = [
		['Palette', [['Adjust'], ['Visualize'], ['Variations'], ['Values'], ['Reset']]],

		[
			'File',
			[
				['Save', IconSave],
				['Open', IconOpen],
				['Export', IconImage]
			]
		],
		[
			'ss',
			[
				['Help', IconInfo],
				['History', IconHistory]
			]
		]
	];

	onMount(() => {
		const stored = localStorage.getItem('menu-open');
		open = stored == 'true';
	});
</script>

<div class="fixed top-6 left-6 z-1000">
	<button class="rounded-md bg-white/50 p-2 text-sm text-black" onclick={() => set_state(!open)}>
		<IconMenu />
	</button>
	{#if open}
		<div class="mt-3 flex gap-6 text-sm text-black">
			<div class="flex flex-col gap-0.5 rounded-md bg-white/50 px-1 py-1">
				{#each options as section}
					<div class="mt-4 border-b border-black/20 px-1 pb-1 first:mt-0">{section[0]}</div>
					{#each section[1] as [name, Icon]}
						<button class="flex items-center gap-1.5 rounded py-0.5 pr-2 pl-1"
							>{#if Icon}
								<Icon />
							{/if}{name}</button
						>
					{/each}
				{/each}
			</div>
		</div>
	{/if}
</div>
