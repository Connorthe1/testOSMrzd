import data from './russia_geojson_wgs84.geojson' assert {type: 'json'};
import stations from './stations.json' assert {type: 'json'};
import lines from './lines.json' assert {type: 'json'};
import linePoints from './linePoints.json' assert {type: 'json'};

window.onload = async function() {

    const corner1 = L.latLng(82.273831, 12)
    const corner2 = L.latLng(37.151806, 177.99319)
    const bounds = L.latLngBounds(corner1, corner2)

    let map = L.map('map', {zoomSnap: 0.5,zoomDelta: 0.5, wheelPxPerZoomLevel: 180, attributionControl: false, maxBounds: bounds});
    map.setView([55.66401, 37.052989], 5);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        noWrap: true,
        minZoom: 5,
        maxZoom: 14,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Russia map
    await L.geoJSON(data, {
        style: function (feature) {
            return {color: feature.properties.color};
        }
    }).addTo(map);

    lines.forEach(line => {
        line.nodes = line.nodes.map(item => {
            const findRef = linePoints.find(point => point.id === item)
            return [findRef.lat,findRef.lon]
        })
    })

    lines.forEach(line => {
        L.polyline(line.nodes, {zIndex: 10, color: '#2b5ad2'}).addTo(map);
    })

    const sortedStations = stations.filter((obj, index, self) =>
        index === self.findIndex((o) => o.tags.name === obj.tags.name)
    );

    sortedStations.forEach((item, idx) => {
        let name = L.divIcon({className: 'station-text', html: item.tags.name});
        L.circleMarker([item.lat,item.lon], {zIndex: 10, fillColor: '#2b5ad2', color: '#a1e4fa', weight: 1, fillOpacity: 1, radius: 5}).addTo(map);
        L.marker([item.lat,item.lon], {icon: name}).addTo(map);
    })
}