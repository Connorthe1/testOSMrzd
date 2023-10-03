// import data from './russia_geojson_wgs84.geojson' assert {type: 'json'};
import stations from './stations.json' assert {type: 'json'};
import additionalStations from './additionalStations.json' assert {type: 'json'};
import additionalLines from './additionalLines.json' assert {type: 'json'};
import j from './j.json' assert {type: 'json'};
import lines from './lines.json' assert {type: 'json'};
import linePoints from './linePoints.json' assert {type: 'json'};

window.onload = async function() {
    const showOts = document.querySelector('#ots')
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

    lines.forEach(line => {
        line.nodes = line.nodes.map(item => {
            const findRef = linePoints.find(point => point.id === item)
            return [findRef.lat,findRef.lon]
        })
    })

    lines.forEach(line => {
        L.polyline(line.nodes, {color: '#3a789d', interactive: false}).addTo(map);
    })

    additionalLines.forEach(line => {
        L.polyline(line.nodes, {color: '#91a1ad', interactive: false}).addTo(map);
    })

    const concatStations = stations.concat(additionalStations)

    const allStationsName = []
    concatStations.forEach((item, idx) => {
        let name = L.divIcon({className: 'station-text', html: `${item.name} (${item.id})`});
        L.circleMarker([item.lat,item.lon], {fillColor: '#2b5ad2', color: '#a1e4fa', weight: 1, fillOpacity: 1, radius: 5, interactive: false}).addTo(map);
        const stationName = L.marker([item.lat,item.lon], {icon: name, interactive: false})
        allStationsName.push(stationName)
    })

    const stationsLayer = L.layerGroup(allStationsName).addTo(map)

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

    const myIcon = L.icon({
        iconUrl: './marker.svg',
        iconSize: [38, 95],
        iconAnchor: [19, 78],
    });
    let currentMarker = {}

    map.on('zoomend', () => {
        showStations(map.getZoom())
    })

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

    const delay = [20319,20369]

    showOts.addEventListener('click', () => {
        delay.forEach(delay => {
            const findStation = concatStations.find(station => station.id === delay)
            if (findStation) {
                const name = L.divIcon({className: 'station-delay-text', html: `${findStation.name} (${findStation.id})`});
                const stationIcon = L.circleMarker([findStation.lat,findStation.lon], {fillColor: '#ffb700', color: '#d39904', weight: 1, fillOpacity: 1, radius: 10});
                const stationName = L.marker([findStation.lat,findStation.lon], {icon: name})
                const group = L.featureGroup([stationIcon,stationName]).addTo(map)
                group.on('mouseover', () => {
                    stationIcon.setStyle({fillColor: '#DE3249',color: '#b22033'})
                })
                group.on('mouseout', () => {
                    stationIcon.setStyle({fillColor: '#ffb700',color: '#d39904'})
                })
                group.on('click', () => {
                    if (Object.keys(currentMarker).length) {
                        markerRemove()
                    }
                    stationIcon.setStyle({opacity: 0, fillOpacity: 0})
                    stationName.setOpacity(0)
                    const marker = L.marker([findStation.lat,findStation.lon], {icon: myIcon})
                    const name = L.divIcon({className: 'marker-text', html: `${findStation.name} (${findStation.id})`});
                    const markerName = L.marker([findStation.lat,findStation.lon], {icon: name})
                    currentMarker.marker = L.featureGroup([marker,markerName]).addTo(map)
                    currentMarker.name = stationName
                    currentMarker.icon = stationIcon
                    currentMarker.marker.on('click', () => {
                        markerRemove()
                    })
                })
            }
        })
    })

    function markerRemove() {
        currentMarker.marker.remove()
        currentMarker.icon.setStyle({opacity: 1, fillOpacity: 1})
        currentMarker.name.setOpacity(1)
        currentMarker = {}
    }

}