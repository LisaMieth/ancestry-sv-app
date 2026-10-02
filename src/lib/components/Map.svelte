<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Map, MarkerClusterGroup } from 'leaflet';
	import L from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import 'leaflet.markercluster';
	import 'leaflet.markercluster/dist/MarkerCluster.css';
	import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
	import { getAllAncestors } from '../../api/queries.js';

	let mapEl: HTMLDivElement;
	let map: Map;
	let clusterGroup: MarkerClusterGroup;

	onMount(async () => {
		map = L.map(mapEl).setView([50, 15], 5);

		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(map);

		clusterGroup = L.markerClusterGroup();

		const ancestors = await getAllAncestors();

		// Popup is built lazily from DOM nodes so DB values are never parsed as HTML
		ancestors.forEach((ancestor) =>
			clusterGroup.addLayer(
				L.marker(ancestor.ancestor_geolocation).bindPopup(() => {
					const popup = document.createElement('div');
					const name = document.createElement('strong');
					name.textContent = ancestor.ancestor_full_name;
					popup.append(
						name,
						document.createElement('br'),
						String(ancestor.ancestor_location_name),
						document.createElement('br'),
						String(ancestor.ancestor_date_ref)
					);
					return popup;
				})
			)
		);

		clusterGroup.addTo(map);
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
