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
    // filter: function (feature, layer) {
    //     return feature.properties.municipio === 'Rio de Janeiro'
    // },

    pointToLayer: function (feature, latlng) {
        const category = feature.properties.categoria;

        const popupContent = `<span>Nome da Ação:</span>${feature.properties.nome_acao}
                              <span>Nome da Comunidade:</span>${feature.properties.nome_comunidade}
                              <span>Premiado</span>${feature.properties.premiado ? 'Sim' : 'Não'}
                              <span>Localidade:</span>${feature.properties.localidade}
                              <span>Organização:</span>${feature.properties.organizacao}
                              <span>Categoria:</span>${feature.properties.categoria}
                              <span>Município:</span>${feature.properties.municipio}
                              <span>Estado:</span>${feature.properties.estado}
                            `

        const {iconClass, markerColor} = categoryMappings[category] || {iconClass: "fa-question", markerColor: "gray"};
        return createMarker(latlng, iconClass, markerColor, popupContent);
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


// function createLegend(map) {
//     const legend = L.control({position: 'bottomright'});
//     legend.onAdd = function () {
//         const div = L.DomUtil.create('div', 'info legend');
//         div.innerHTML = '<h4>LEGENDA</h4>';
//         const legendItems = [];
//
//         for (const category in categoryMappings) {
//             const {iconClass, markerColor} = categoryMappings[category];
//             const icon = L.AwesomeMarkers.icon({
//                 prefix: 'fa',
//                 icon: iconClass,
//                 markerColor: markerColor,
//             });
//
//             const iconHTML = icon.createIcon().outerHTML;
//             const categoryHTML = `<span>${category}</span>`;
//
//             legendItems.push(`<div class="legend-icon">${iconHTML}<span class="span-txt">${categoryHTML}</span></div><br>`);
//         }
//
//         div.innerHTML += legendItems.join('<br>');
//         return div;
//     };
//     legend.addTo(map);
// }
//
// createLegend(map);

const legend = L.control({position: 'bottomright'});
const iconURL = $("#default-icon").val();

function renderLegend() {
    return `
<h4 class="legend-title">
<i class="fa-solid fa-list-ul"></i>
LEGENDA
</h4>
<div class="legend-items">
<div class="awesome-marker-icon-cadetblue awesome-marker leaflet-zoom-animated leaflet-interactive" role="button">
<i class="fa fa-scale-balanced  icon-white" aria-hidden="true"></i>
</div>
<span class="txt-info">Acesso à Justiça e Combate às Desigualdades</span>


<div class="awesome-marker-icon-blue awesome-marker leaflet-zoom-animated leaflet-interactive" role="button">
<i class="fa fa-cloud-sun-rain  icon-white" aria-hidden="true"></i>
</div>
<span class="txt-info">Planejamento Urbano, Gestão de Riscos e Responsabilidade Climática</span>

<div class="awesome-marker-icon-orange awesome-marker leaflet-zoom-animated leaflet-interactive" role="button">
<i class=" fa fa-graduation-cap  icon-white" aria-hidden="true"></i>
</div>
<span class="txt-info">Comunicação, Inclusão Digital e Educação Popular</span>

<div class="awesome-marker-icon-pink awesome-marker leaflet-zoom-animated leaflet-interactive" role="button">
<i class="fa fa-masks-theater  icon-white" aria-hidden="true"></i> 
</div>
<span class="txt-info">Cultura e Memória</span>

<div class="awesome-marker-icon-red awesome-marker leaflet-zoom-animated leaflet-interactive" role="button">
<i class="fa fa-briefcase-medical  icon-white" aria-hidden="true"></i>
</div>
<span class="txt-info">Saúde Integral e Dignidade Humana</span>

<div class="awesome-marker-icon-black awesome-marker leaflet-zoom-animated leaflet-interactive" role="button">
<i class="fa fa-utensils  icon-white" aria-hidden="true"></i>
</div>
<span class="txt-info">Soberania Alimentar e Nutricional</span>

<div class="awesome-marker-icon-darkgreen awesome-marker leaflet-zoom-animated leaflet-interactive" role="button">
<i class="fa fa-sack-dollar  icon-white" aria-hidden="true"></i>
</div>
<span class="txt-info">Economia Solidária</span>
</div>
        `
}

legend.onAdd = function () {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML += renderLegend()
    return div
};
legend.addTo(map);


$(".info").hover(function () {
    $(".legend-items").show();
}, function () {
    $(".legend-items").hide();
});