// import data from './russia_geojson_wgs84.geojson' assert {type: 'json'};
import stations from './stations.json' assert {type: 'json'};
import additionalStations from './additionalStations.json' assert {type: 'json'};
import additionalLines from './additionalLines.json' assert {type: 'json'};
import j from './j.json' assert {type: 'json'};
import lines from './lines.json' assert {type: 'json'};
import linePoints from './linePoints.json' assert {type: 'json'};
import { findPointsWithMargin } from './parallelPoint.js'

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
        L.polyline(line.nodes, {color: '#3a789d', interactive: false}).addTo(map);
    })

    const concatStations = stations.concat(additionalStations)

    const allStationsName = []
    concatStations.forEach((item, idx) => {
        let name = L.divIcon({className: 'station-text', html: `${item.name} (${item.id})`});
        L.circleMarker([item.lat,item.lon], {fillColor: '#2b5ad2', color: '#a1e4fa', weight: 1, fillOpacity: 1, radius: 5, interactive: false}).addTo(map);
        const stationName = L.marker([item.lat,item.lon], {icon: name, interactive: false})
        stationName.id = item.id
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
    const myWarn = L.icon({
        iconUrl: './warning.svg',
        iconSize: [30,30],
        iconAnchor: [15, 15],
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

    const delayLines = [
        {
            idStation1: 20382,
            idStation2: 20381
        },
        {
            idStation1: 20383,
            idStation2: 20318
        }
    ]

    showOts.addEventListener('click', () => {
        stationsLayer.eachLayer((l) => {
            if (delay.some(item => item === l.id)) {
                l.remove()
            }
        })

        delayLines.forEach(line => {
            const st1 = concatStations.find(station => station.id === line.idStation1)
            const st2 = concatStations.find(station => station.id === line.idStation2)
            if (st1 && st2) {
                const line = L.polyline([[st1.lat,st1.lon],[st2.lat,st2.lon]], {color: '#ff9900', weight: 8}).addTo(map);
                const centerBetweenNoOffset = findPointsWithMargin(Number(st1.lat),Number(st1.lon),Number(st2.lat),Number(st2.lon), 0)
                // const lineIcon = L.circleMarker([centerBetween.x,centerBetween.y], {fillColor: '#ffffff', color: '#d39904', weight: 3, fillOpacity: 1, radius: 12}).addTo(map)

                line.on('mouseover', () => {
                    line.setStyle({color: '#4795C3'})
                })
                line.on('mouseout', () => {
                    line.setStyle({color: '#ff9900'})
                })
                line.on('click', () => {
                    if (Object.keys(currentMarker).length) {
                        markerRemove()
                    }
                    // lineIcon.setStyle({opacity: 0, fillOpacity: 0})
                    const marker = L.marker([centerBetweenNoOffset.x,centerBetweenNoOffset.y], {icon: myIcon})
                    const nameText = L.divIcon({className: 'marker-text', html: `${st1.name} - ${st2.name}`});
                    const countText = L.divIcon({className: 'marker-counter', html: `27`});
                    const markerName = L.marker([centerBetweenNoOffset.x,centerBetweenNoOffset.y], {icon: nameText})
                    const markerCount = L.marker([centerBetweenNoOffset.x,centerBetweenNoOffset.y], {icon: countText})
                    currentMarker.marker = L.featureGroup([marker,markerName,markerCount]).addTo(map)
                    currentMarker.marker.on('click', () => {
                        markerRemove()
                    })
                })
            }
        })


        delay.forEach(delay => {
            const findStation = concatStations.find(station => station.id === delay)
            if (findStation) {
                const name = L.divIcon({className: 'station-delay-text', html: `${findStation.name} (${findStation.id})`});
                const stationIcon = L.circleMarker([findStation.lat,findStation.lon], {fillColor: '#ffb700', color: '#d39904', weight: 1, fillOpacity: 1, radius: 10});
                const stationName = L.marker([findStation.lat,findStation.lon], {icon: name})
                const group = L.featureGroup([stationIcon,stationName]).addTo(map)
                group.on('mouseover', () => {
                    stationIcon.setStyle({fillColor: '#4795C3',color: '#1774a1'})
                })
                group.on('mouseout', () => {
                    stationIcon.setStyle({fillColor: '#ffb700',color: '#d39904'})
                })
                group.on('click', () => {
                    if (Object.keys(currentMarker).length) {
                        markerRemove()
                    }
                    stationIcon.setStyle({fillColor: '#ffb700',color: '#d39904'})
                    group.remove()
                    const marker = L.marker([findStation.lat,findStation.lon], {icon: myIcon})
                    const nameText = L.divIcon({className: 'marker-text', html: `${findStation.name} (${findStation.id})`});
                    const countText = L.divIcon({className: 'marker-counter', html: `27`});
                    const markerName = L.marker([findStation.lat,findStation.lon], {icon: nameText})
                    const markerCount = L.marker([findStation.lat,findStation.lon], {icon: countText})
                    currentMarker.marker = L.featureGroup([marker,markerName,markerCount]).addTo(map)
                    currentMarker.group = group
                    currentMarker.marker.on('click', () => {
                        markerRemove()
                    })
                })
            }
        })
    })

    function markerRemove() {
        currentMarker.marker.remove()
        currentMarker.group?.addTo(map)
        // currentMarker.icon?.setStyle({opacity: 1, fillOpacity: 1})
        // currentMarker.name?.setOpacity(1)
        currentMarker = {}
    }

}