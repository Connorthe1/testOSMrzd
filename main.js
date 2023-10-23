import stations from './stations.json' assert {type: 'json'};
import additionalStations from './additionalStations.json' assert {type: 'json'};
import additionalLines from './additionalLines.json' assert {type: 'json'};
import j from './j.json' assert {type: 'json'};
import lines from './lines.json' assert {type: 'json'};
import linePoints from './linePoints.json' assert {type: 'json'};
import { findPointsWithMargin } from './parallelPoint.js'

window.onload = async function() {
    const colors = {
        lineDefault: '#ff9900',
        lineHover: '#4795C3',
        lineOts: '#ea041f',
        stationDefault: '#ffb700',
        stationOutline: '#d39904',
        stationHover: '#4795C3',
        stationHoverOutline: '#1774a1',
        stationOts: '#ea041f',
        stationOtsOutline: '#9f0626',
    }

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

    // L.maplibreGL({
    //     maxZoom: 15,
    //     minZoom: 4,
    //     style: './mapStyle.json',
    //     noWrap: true,
    // }).addTo(map);

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
            idStation2: 20381,
            isOts: false
        },
        {
            idStation1: 20383,
            idStation2: 20318,
            isOts: true
        }
    ]
    const ots = 20383
    let clicked = false

    showOts.addEventListener('click', () => {
        if (clicked) {
            const findOts = concatStations.find(station => station.id === ots)
            if (findOts) {
                map.setView([findOts.lat, findOts.lon], 13);
            }
            return
        }
        clicked = true
        const findOts = concatStations.find(station => station.id === ots)
        if (findOts) {
            map.setView([findOts.lat, findOts.lon], 13);
        }

        const allSelected = [...delay]
        allSelected.push(ots)
        stationsLayer.eachLayer((l) => {
            if (allSelected.some(item => item === l.id)) {
                l.remove()
            }
        })

        delayLines.forEach(line => {
            const st1 = concatStations.find(station => station.id === line.idStation1)
            const st2 = concatStations.find(station => station.id === line.idStation2)
            if (st1 && st2) {
                createSelectedLine(st1, st2, line.isOts)
            }
        })


        delay.forEach(delay => {
            const findStation = concatStations.find(station => station.id === delay)
            if (findStation) {
                createSelectedStation(findStation, false)
            }
        })

        createSelectedStation(findOts, true)
    })

    function createSelectedLine(st1, st2, isOts) {
        const line = L.polyline([[st1.lat,st1.lon],[st2.lat,st2.lon]], {color: isOts ? colors.lineOts : colors.lineDefault, weight: 8}).addTo(map)
        const centerBetweenNoOffset = findPointsWithMargin(Number(st1.lat),Number(st1.lon),Number(st2.lat),Number(st2.lon), 0)
        const delayCountText = L.divIcon({className: 'delay-marker-counter', html: `27`});
        const delayMarker = L.circleMarker([centerBetweenNoOffset.x,centerBetweenNoOffset.y], {fillColor: '#fff', color: isOts ? colors.lineOts : colors.lineDefault, weight: 5, fillOpacity: 1, radius: 16})
        const delayCount = L.marker([centerBetweenNoOffset.x,centerBetweenNoOffset.y], {icon: delayCountText})

        const delayCounter = L.featureGroup([delayMarker,delayCount]).addTo(map)

        const group = L.featureGroup([line,delayCounter])

        let markerOts
        if (isOts) {
            const otsText = L.divIcon({className: 'marker-ots', html: `Место ОТС`});
            markerOts = L.marker([centerBetweenNoOffset.x,centerBetweenNoOffset.y], {icon: otsText}).addTo(map)
            markerOts.setOpacity(0)
        }

        group.on('mouseover', () => {
            if (markerOts) {
                markerOts.setOpacity(1)
            }
            line.setStyle({color: colors.lineHover})
            delayMarker.setStyle({color: colors.lineHover})
        })
        group.on('mouseout', () => {
            if (markerOts) {
                markerOts.setOpacity(0)
            }

            line.setStyle({color: isOts ? colors.lineOts : colors.lineDefault})
            delayMarker.setStyle({color: isOts ? colors.lineOts : colors.lineDefault})
        })
        group.on('click', () => {
            if (markerOts) {
                markerOts.setOpacity(0)
            }
            if (Object.keys(currentMarker).length) {
                markerRemove()
            }
            line.setStyle({color: isOts ? colors.lineOts : colors.lineDefault})
            delayMarker.setStyle({color: isOts ? colors.lineOts : colors.lineDefault})
            delayCounter.remove()
            // lineIcon.setStyle({opacity: 0, fillOpacity: 0})
            const marker = L.marker([centerBetweenNoOffset.x,centerBetweenNoOffset.y], {icon: myIcon})
            const nameText = L.divIcon({className: isOts ? 'marker-text-ots' : 'marker-text', html: `${st1.name} - ${st2.name} ${isOts ? '(Место ОТС)' : ''}`});
            const countText = L.divIcon({className: 'marker-counter', html: `27`});
            const markerName = L.marker([centerBetweenNoOffset.x,centerBetweenNoOffset.y], {icon: nameText})
            const markerCount = L.marker([centerBetweenNoOffset.x,centerBetweenNoOffset.y], {icon: countText})
            currentMarker.marker = L.featureGroup([marker,markerName,markerCount]).addTo(map)
            currentMarker.group = delayCounter
            currentMarker.marker.on('click', () => {
                markerRemove()
            })
        })
    }

    function createSelectedStation(findStation, isOts) {
        const name = L.divIcon({className: 'station-delay-text', html: `${findStation.name} (${findStation.id})`});
        const stationIcon = L.circleMarker([findStation.lat,findStation.lon], {fillColor: isOts ? colors.stationOts : colors.stationDefault, color: isOts ? colors.stationOtsOutline: colors.stationOutline, weight: 2, fillOpacity: 1, radius: 10});
        const stationName = L.marker([findStation.lat,findStation.lon], {icon: name})
        const group = L.featureGroup([stationIcon,stationName]).addTo(map)
        group.on('mouseover', () => {
            stationIcon.setStyle({fillColor: colors.stationHover, color: colors.stationHoverOutline})
        })
        group.on('mouseout', () => {
            stationIcon.setStyle({fillColor: isOts ? colors.stationOts : colors.stationDefault, color: isOts ? colors.stationOtsOutline: colors.stationOutline })
        })
        group.on('click', () => {
            if (Object.keys(currentMarker).length) {
                markerRemove()
            }
            stationIcon.setStyle({fillColor: isOts ? colors.stationOts : colors.stationDefault, color: isOts ? colors.stationOtsOutline: colors.stationOutline })
            group.remove()
            const marker = L.marker([findStation.lat,findStation.lon], {icon: myIcon})
            const nameText = L.divIcon({className: isOts ? 'marker-text-ots' : 'marker-text', html: `${findStation.name} (${findStation.id}) ${isOts ? '(Место ОТС)' : ''}`});
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

    function markerRemove() {
        currentMarker.marker.remove()
        currentMarker.group?.addTo(map)
        // currentMarker.icon?.setStyle({opacity: 1, fillOpacity: 1})
        // currentMarker.name?.setOpacity(1)
        currentMarker = {}
    }

}