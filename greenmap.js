/**
 * Configuration
 */
var gpxDataLocation = 'https://zielonebryle.pl/data/gpx'
var imageDataLocation = 'https://zielonebryle.pl/data/image'
L.mapbox.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
var mapLayer = 'mapbox://styles/mapbox/light-v10'
var mapHtmlContainerId = 'map'

//var defaultTrackColor = 'rgb(32, 200, 84)'
var defaultTrackColor = '#c77c30' //4fb954 7afe6c
var mouseOverTrackColor = '#ffc234'

main()

function main() {
    var mymap = L.mapbox.map(mapHtmlContainerId, null, { zoomControl: false })
        .addLayer(L.mapbox.styleLayer(mapLayer))
        // Fit Poland on the map
        .fitBounds([
            [54.8, 24.09], // north-east corner
            [49.00, 14.07]  // south-west corner
        ])

    addLogo(mymap)

    var gpxFolders = getJSON(gpxDataLocation + '/gpxFolders.json').gpxFolders

    for (var folderIndex = 0; folderIndex < gpxFolders.length; folderIndex += 1) {
        var gpxFiles = getJSON(gpxDataLocation + '/' + gpxFolders[folderIndex] + '/gpxFiles.json').gpxFiles
        var folderLayer = loadFolderAsLayer(gpxFolders[folderIndex], gpxFiles)
        // Add journey to the map
        folderLayer.addTo(mymap)
    }

}

function getJSON(url) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url, false)
    xhr.send()
    if (xhr.status === 200) {
        return JSON.parse(xhr.response)
    } else {
        console.error('Something went wrong: ' + xhr.status)
    }
}

function loadFolderAsLayer(folder, gpxFiles) {
    // A parent layer for all day layers of a single journey
    var journeyTrackLayer = new L.FeatureGroup()
    // Set the base style for all GPX tracks
    var gpxTrackBorderLayer = L.geoJson(null, {
        style: function(feature) {
            return {
                color: '#000000',
                opacity: 1,
                weight: 6
            }
        }
    })
    var gpxTrackFillingLayer = L.geoJson(null, {
        style: function(feature) {
            return {
                color: 'rgb(60,240,120)',
                opacity: 1,
                weight: 3
            }
        }
    })

    // Load all day GPX files of a single journey
    for (var fileIndex = 0; fileIndex < gpxFiles.length; fileIndex += 1) {
        var dayTrackBorderLayer = omnivore.gpx(gpxDataLocation + '/' + folder + '/' + gpxFiles[fileIndex], null, gpxTrackBorderLayer)
        journeyTrackLayer.addLayer(dayTrackBorderLayer)
        var dayTracFillingLayer = omnivore.gpx(gpxDataLocation + '/' + folder + '/' + gpxFiles[fileIndex], null, gpxTrackFillingLayer)
        journeyTrackLayer.addLayer(dayTracFillingLayer)
    }
    // Mouse over the journey track behavior
    journeyTrackLayer.on('mouseover', function(e) {
        journeyTrackLayer.eachLayer(function(layer) {
            layer.setStyle({
                color: mouseOverTrackColor,
                opacity: 1,
                weight: 6
            })
        })
    })
    // Mouse out of the journey track behavior
    journeyTrackLayer.on('mouseout', function(e) {
        journeyTrackLayer.eachLayer(function(layer) {
            layer.setStyle({
                color: defaultTrackColor,
                opacity: 1,
                weight: 6
            })
        })
    })
    return journeyTrackLayer
}

function addLogo(mymap) {
    L.LogoControl = L.Control.extend({
        options: {
            position: 'topleft'
            //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
        },
        onAdd: function (map) {
            //var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control logo-control')
            var container = L.DomUtil.create('div', 'leaflet-control logo-control')
            var button = L.DomUtil.create('a', '', container)
            //button.innerHTML = '<img width="100%" class="logo-control-img" src="https://cdn-public-assets.join.com/2021/02/b3921997-stack-overflow-logo.png">'
            button.innerHTML = '<img width="240px" class="logo-control-img" src="' + imageDataLocation +  '/bryle_g.png">'
            L.DomEvent.disableClickPropagation(button);
            container.title = "ZieloneBryle.pl";
            return container;
        },
    })
    new L.LogoControl().addTo(mymap)
}
