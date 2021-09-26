const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations)

mapboxgl.accessToken = 'pk.eyJ1IjoiaHlwaGVubyIsImEiOiJja3Uwem4zcG4zc2s2MnVtcDRwaDNyY2ptIn0.WHA6pLOGvAw-222TwhSPxQ';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/hypheno/cku0zuid23ezl18lhmujgvj23'
    // center: [77.1025, 28.7041],
    // zoom: 4
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
    }).setLngLat(loc.coordinates).addTo(map);

    // Add popup
    new mapboxgl.Popup({
        offset: 30
    }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
});

map.fitBounds(bounds);