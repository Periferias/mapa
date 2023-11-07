const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 21,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

const bounds = L.latLngBounds(
    L.latLng(5.397273407690917, -32.21191406250001),
    L.latLng(-33.247875947924385, -78.00292968750001)
);

const acoesUrl = $('#acoes_geojson').val();

function createMarker(latlng, iconClass, markerColor, popupContent) {
    return L.marker(latlng, {
        icon: L.AwesomeMarkers.icon({
            prefix: 'fa',
            icon: iconClass,
            markerColor: markerColor,
        }),
    }).bindPopup(popupContent);
}

const categoryMappings = {
    "Acesso à Justiça e Combate às Desigualdades": {
        iconClass: "fa-scale-balanced",
        markerColor: "cadetblue"
    },
    "Planejamento Urbano, Gestão de Riscos e Responsabilidade Climática": {
        iconClass: "fa-cloud-sun-rain",
        markerColor: "blue"
    },
    "Comunicação, Inclusão Digital e Educação Popular": {
        iconClass: "fa-graduation-cap",
        markerColor: "orange"
    },
    "Cultura e Memória": {
        iconClass: "fa-masks-theater",
        markerColor: "pink"
    },
    "Saúde Integral e Dignidade Humana": {
        iconClass: "fa-briefcase-medical",
        markerColor: "red"
    },
    "Soberania Alimentar e Nutricional": {
        iconClass: "fa-utensils",
        markerColor: "black"
    },
    "Economia Solidária": {
        iconClass: "fa-sack-dollar",
        markerColor: "darkgreen"
    },
};

const acoesLayer = new L.GeoJSON.AJAX(acoesUrl, {
    pointToLayer: function (feature, latlng) {
        const category = feature.properties.categoria;
        const {iconClass, markerColor} = categoryMappings[category] || {iconClass: "fa-question", markerColor: "gray"};
        return createMarker(latlng, iconClass, markerColor, feature.properties.popup_content);
    },
});


const acoesCluster = new L.markerClusterGroup();

const map = L.map('map', {
    zoom: 4,
    zoomControl: false,
    minZoom: 5,
    maxBounds: bounds,
    layers: [osm, acoesCluster]
});

map.spin(true);

acoesLayer.on('data:loaded', function () {
    acoesCluster.addLayer(acoesLayer)
    map.spin(false);

});

map.fitBounds(bounds)
map.setMinZoom(map.getBoundsZoom(map.options.maxBounds));

const baseLayers = {
    'OpenStreetMap': osm,
};

const overlays = {
    'Ações': acoesCluster,
};

const layerControl = L.control.layers(baseLayers, overlays).addTo(map);

// ----------- plugins ------------
const fullScreen = L.control.fullscreen({
    position: 'topleft',
    title: 'Mapa em tela cheia',
    titleCancel: 'Sair da tela cheia',
    fullscreenControl: true,
});
fullScreen.addTo(map);


const zoomHome = L.Control.zoomHome({
    zoomHomeTitle: 'Zoom Inicial',
});
zoomHome.addTo(map);

const coordinates = L.control.coordinates({
    enableUserInput: false,
    useDMS: true,
    position: 'bottomleft',
    decimals: 5,
    decimalSeperator: ",",
    labelTemplateLng: "Long: {x}",
    labelTemplateLat: "Lat: {y}"
})

coordinates.addTo(map);


function createLegend(map) {
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        div.innerHTML = '<h4>LEGENDA</h4>';
        const legendItems = [];

        for (const category in categoryMappings) {
            const {iconClass, markerColor} = categoryMappings[category];
            const icon = L.AwesomeMarkers.icon({
                prefix: 'fa',
                icon: iconClass,
                markerColor: markerColor,
            });

            const iconHTML = icon.createIcon().outerHTML;
            const categoryHTML = `<span>${category}</span>`;

            legendItems.push(`<div class="legend-icon">${iconHTML}<span class="span-txt">${categoryHTML}</span></div><br>`);
        }

        div.innerHTML += legendItems.join('<br>');
        return div;
    };
    legend.addTo(map);
}

// Add the legend to your map
createLegend(map);
