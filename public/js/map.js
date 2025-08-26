document.addEventListener("DOMContentLoaded", function () {
    const mapDiv = document.getElementById("map");
    if (!mapDiv) return;

    const map = tt.map({
        key: TOMTOM_API_KEY,
        container: "map",
        center: listing.geometry.coordinates,
        zoom: 12
    });

    map.addControl(new tt.NavigationControl());

     const popup = new tt.Popup({ offset: 35 }) // offset to move it above the marker
        .setHTML("<p>Exact location provided after booking.</p>");

    const marker = new tt.Marker().setLngLat(listing.geometry.coordinates).addTo(map);
     
    const markerEl = marker.getElement();

    markerEl.addEventListener('mouseenter', () => {
        popup.setLngLat(listing.geometry.coordinates).addTo(map);
    });

    markerEl.addEventListener('mouseleave', () => {
        popup.remove();
    });
});


