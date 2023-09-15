import data from './russia_geojson_wgs84.geojson' assert {type: 'json'};
import stations from './stations.json' assert {type: 'json'};
import lines from './lines.json' assert {type: 'json'};
import linePoints from './linePoints.json' assert {type: 'json'};

window.onload = async function() {

    const corner1 = L.latLng(82.273831, 7.501591)
    const corner2 = L.latLng(37.151806, 177.99319)
    const bounds = L.latLngBounds(corner1, corner2)

    let map = L.map('map', {zoomSnap: 0.5,zoomDelta: 0.5, wheelPxPerZoomLevel: 180, attributionControl: false, maxBounds: bounds});
    map.setView([55.66401, 37.052989], 5);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        noWrap: true,
        minZoom: 3,
        maxZoom: 14,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    //Russia map
    // await L.geoJSON(data, {
    //     style: function (feature) {
    //         return {color: feature.properties.color};
    //     }
    // }).addTo(map);

    //railroads
    // await L.geoPackageFeatureLayer([], {
    //     geoPackageUrl: './rzd.gpkg',
    //     layerName: 'railways',
    //     style: {color: 'black', weight: 2.5, opacity: 0.6},
    // }).addTo(map);
    // await L.geoPackageFeatureLayer([], {
    //     geoPackageUrl: './rzd.gpkg',
    //     layerName: 'railways',
    //     style: {color: 'white', dashArray: '5, 10', weight: 2, opacity: 0.8},
    // }).addTo(map);

    lines.forEach(line => {
        line.nodes = line.nodes.map(item => {
            const findRef = linePoints.find(point => point.id === item)
            return [findRef.lat,findRef.lon]
        })
    })

    lines.forEach(line => {
        L.polyline(line.nodes, {zIndex: 10, color: 'red'}).addTo(map);
    })

    const sortedStations = stations.filter((obj, index, self) =>
        index === self.findIndex((o) => o.tags.name === obj.tags.name)
    );

    sortedStations.forEach((item, idx) => {
        L.circleMarker([item.lat,item.lon], {zIndex: 10, color: 'blue'}).bindTooltip(`${item.tags.name}`, {permanent: true, direction: 'top'}).addTo(map);
    })
}