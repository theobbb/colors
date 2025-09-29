<script>
	import IconAdd from '$lib/assets/icons/icon-add.svelte';

	const { first = false, last = false, onclick } = $props();
</script>

<div
	class={[
		'group/container absolute top-0 z-20 flex h-full items-center justify-center',
		first && 'left-0',
		last && 'right-0',
		(first || last) && 'w-1/3',
		!first && !last && 'right-0 w-2/3 translate-x-1/2'
	]}
>
	<button
		{onclick}
		class="group pointer-events-auto rounded-full bg-white p-1 text-2xl text-black opacity-0 transition group-hover/container:opacity-100"
	>
		<div class="rounded-full p-1 group-hover:bg-black/10">
			<IconAdd />
		</div>
	</button>
</div>
