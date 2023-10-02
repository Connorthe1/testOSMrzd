// import data from './russia_geojson_wgs84.geojson' assert {type: 'json'};
import stations from './stations.json' assert {type: 'json'};
import additionalStations from './additionalStations.json' assert {type: 'json'};
import additionalLines from './additionalLines.json' assert {type: 'json'};
import j from './j.json' assert {type: 'json'};
import lines from './lines.json' assert {type: 'json'};
import linePoints from './linePoints.json' assert {type: 'json'};

window.onload = async function() {
    // const showOts = document.querySelector('#ots')
    const search = document.querySelector('#search')
    const searchButton = document.querySelector('#searchButton')

    const corner1 = L.latLng(82.273831, 12)
    const corner2 = L.latLng(37.151806, 177.99319)
    const bounds = L.latLngBounds(corner1, corner2)

    const key = '9uMou4WBAcqERBnW7CQj';
    const map = L.map('map', {
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 180,
        maxZoom: 14,
        minZoom: 5,
        scrollWheelZoom: false, // disable original zoom function
        smoothWheelZoom: true,  // enable smooth zoom
        smoothSensitivity: 4,
        maxBounds: bounds
    })
    map.setView([52.289588, 104.280606], 6);

    L.maptilerLayer({
        apiKey: key,
        maxZoom: 14,
        minZoom: 4,
        // style: "97153cbc-9568-4fe0-8863-bfc30bd5cd18", //optional
        noWrap: true,
    }).addTo(map);


    // const map = L.map('map', {
    //     attributionControl: false,
    //     scrollWheelZoom: false, // disable original zoom function
    //     smoothWheelZoom: true,  // enable smooth zoom
    //     smoothSensitivity: 4,
    //     zoomSnap: 0.5,
    //     zoomDelta: 0.5,
    //     wheelPxPerZoomLevel: 180,
    //     maxBounds: bounds
    // }).setView([52.289588, 104.280606], 6); //starting position
    //
    // L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${key}`,{ //style URL
    //     tileSize: 512,
    //     zoomOffset: -1,
    //     minZoom: 4,
    //     maxZoom: 15,
    //     attribution: "",
    //     crossOrigin: true
    // }).addTo(map);

    // Russia map
    // await L.geoJSON(data, {
    //     style: function (feature) {
    //         return {color: feature.properties.color};
    //     }
    // }).addTo(map);

    lines.forEach(line => {
        line.nodes = line.nodes.map(item => {
            const findRef = linePoints.find(point => point.id === item)
            return [findRef.lat,findRef.lon]
        })
    })

    lines.forEach(line => {
        L.polyline(line.nodes, {color: '#3a789d'}).addTo(map);
    })

    additionalLines.forEach(line => {
        L.polyline(line.nodes, {color: '#91a1ad'}).addTo(map);
    })

    const concatStations = stations.concat(additionalStations)

    // const sortedStations = concatStations.filter((obj, index, self) =>
    //     index === self.findIndex((o) => o.name === obj.name)
    // );

    const allStations = []
    concatStations.forEach((item, idx) => {
        let name = L.divIcon({className: 'station-text', html: `${item.name} (${item.id})`});
        const stationIcon = L.circleMarker([item.lat,item.lon], {fillColor: '#2b5ad2', color: '#a1e4fa', weight: 1, fillOpacity: 1, radius: 5});
        const stationName = L.marker([item.lat,item.lon], {icon: name})
        const stationGroup = L.featureGroup([stationIcon,stationName]).addTo(map)
        allStations.push(stationName)
    })

    const stationsLayer = L.layerGroup(allStations).addTo(map)

    showStations(5)
    function showStations(zoom) {
        if (zoom > 11) {
            stationsLayer.eachLayer(function(layer) {
                layer.setOpacity(1);
            });
        } else {
            stationsLayer.eachLayer(function(layer) {
                layer.setOpacity(0);
            });
        }
    }

    map.on('zoomend', () => {
        showStations(map.getZoom())
    })

    // showOts.addEventListener('click', () => {
    //     lines.forEach(line => {
    //         L.polyline(line.nodes, {color: '#f3c71b'}).addTo(map);
    //     })
    // })

    searchButton.addEventListener('click', () => {
        const res = j.find(item => item.tags.name?.toLowerCase().includes(search.value.toLowerCase()))
        const findId = concatStations.find(item => item.id === Number(search.value))
        console.log(res)
        if (res) {
            map.setView([res.lat, res.lon], 14);
            return
        }
        if (findId) {
            map.setView([findId.lat, findId.lon], 14);
            return
        }
    })
}