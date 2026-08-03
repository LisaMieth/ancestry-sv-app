<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Map } from 'leaflet';
	import L from 'leaflet';
	import 'leaflet/dist/leaflet.css';

	let mapEl: HTMLDivElement;
	let map: Map;

	onMount(() => {
		map = L.map(mapEl).setView([50, 15], 5);

		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(map);
	});

	onDestroy(() => {
		map?.remove();
	});
</script>

<div bind:this={mapEl} class="map"></div>

<style>
	.map {
		width: 100%;
		height: 100%;
	}
</style>
