<script lang="ts">
	import { onMount } from 'svelte';

	let open = $state(false);

	function set_state(state: boolean) {
		open = state;
		localStorage.setItem('menu-open', String(state));
	}

	function onclick() {
		console.log('click');
	}

	function create_palette() {
		create_palette();
	}

	const navigation = [
		[
			'File',
			[
				['New', create_palette, 'Ctrl+N'],
				['Open', onclick, 'Ctrl+O'],
				['Export', onclick, 'Ctrl+E'],
				['Save As', onclick, 'Ctrl+S']
			]
		],

		[
			'Edit',
			[
				['Undo', onclick, 'Ctrl+Z'],
				['Redo', onclick, 'Ctrl+Y'],
				['Variations', onclick],
				['Values', onclick],
				['Reset', onclick]
			]
		],

		[
			'Palette',
			[
				['Color Mode', onclick],
				['Adjust', onclick],
				['Visualize', onclick],
				['Variations', onclick],
				['Values', onclick],
				['Reset', onclick]
			]
		],

		[
			'Appearance',
			[
				['Theme', onclick],
				['Font', onclick]
			]
		]

		// ['Help', [['About', onclick], ['History', onclick]]]
	];

	onMount(() => {
		const stored = localStorage.getItem('menu-open');
		open = stored == 'true';
	});

	let focused = $state(false);
</script>

<div class="fixed top-0 right-0 left-0 z-1000">
	<div class="text-sm- flex w-full gap-0.5 bg-black whitespace-nowrap text-white backdrop-blur-xl">
		{#each navigation as [section, options]}
			<div class="relative">
				<button
					class="peer flex items-center gap-1.5 py-0.5 pr-2 pl-2 hover:bg-white hover:text-black"
					>{section}</button
				>
				<div
					class="invisible absolute bottom-0 flex translate-y-full flex-col bg-black peer-hover:visible hover:visible"
				>
					{#each options as [name, fn, shortcut]}
						<button
							class="flex w-full justify-between gap-6 py-0.5 pr-2 pl-2 text-left hover:bg-white hover:text-black"
						>
							<span>{name}</span>
							{#if shortcut}
								<span>{shortcut}</span>
							{/if}
						</button>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
<!-- <div class="fixed top-6 left-6 z-1000">
	<button
		class="rounded-md bg-white/50 p-2 text-sm text-black backdrop-blur-md"
		onclick={() => set_state(!open)}
	>
		<IconMenu />
	</button>
	{#if open}
		<div class="mt-3 flex gap-6 text-sm text-black">
			<div class="flex flex-col gap-0.5 rounded-md bg-white/60 px-1 py-1 backdrop-blur-md">
				{#each options as section}
					{#each section as [name, Icon]}
						<button
							class="flex items-center gap-1.5 rounded py-0.5 pr-6 pl-2 hover:bg-black hover:text-white"
							>{#if Icon}
								<Icon />
							{/if}{name}</button
						>
					{/each}
					<div class="my-1 border-b border-black/20 last:hidden"></div>
				{/each}
			</div>
		</div>
	{/if}
</div> -->
