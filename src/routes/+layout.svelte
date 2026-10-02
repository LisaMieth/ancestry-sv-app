<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	// import FamilyBranchTest from '$lib/components/FamilyBranchTest.svelte';
	import Map from '$lib/components/Map.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<Map />
{@render children()}
