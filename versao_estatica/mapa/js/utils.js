var zoomHome = L.Control.zoomHome({
    zoomHomeTitle: 'Zoom Inicial',
    position: 'topright',
});

var fullScreen = L.control.fullscreen({
    position: 'topright',
    title: 'Mapa em tela cheia',
    titleCancel: 'Sair da tela cheia',
    fullscreenControl: true,
});

var geocodingSearch = L.control.maptilerGeocoding({
        apiKey: 'todhtNTYQmjE6y5MNZ9k',
        placeholder: 'Pesquisar por localização...',
        collapse: false,
        language: 'pt',
        country: 'br',
        noResultsMessage: '"Ops! Não conseguimos encontrar o que você está procurando. ' +
            'Tente verificar a ortografia ou um outro termo de pesquisa.'

    },
);

var coordinates = L.control.coordinates({
    enableUserInput: false,
    useDMS: true,
    position: 'bottomleft',
    decimals: 5,
    decimalSeperator: ",",
    labelTemplateLng: "Long: {x}",
    labelTemplateLat: "Lat: {y}"
});

var acoesUrl = $('#acoes_geojson').val();

var categoryMappings = {
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

function createMarker(latlng, iconClass, markerColor, popupContent) {
    return L.marker(latlng, {
        icon: L.AwesomeMarkers.icon({
            prefix: 'fa',
            icon: iconClass,
            markerColor: markerColor,
        }),
    }).bindPopup(popupContent);
}

function pointToLayer(feature, latlng) {
    var category = feature.properties.categoria;

    var popupContent = `<span>Organização:</span>${feature.properties.organizacao}
                        <span>Categoria:</span>${feature.properties.categoria}
                        <span>Localidade:</span>${feature.properties.localidade}
                        <span>Premiado</span>${feature.properties.premiado ? 'Sim' : 'Não'}
                        <span>Município/Estado:</span>${feature.properties.municipio}/${feature.properties.estado}
                       `

    var {iconClass, markerColor} = categoryMappings[category] || {
        iconClass: "fa-question",
        markerColor: "gray"
    };
    return createMarker(latlng, iconClass, markerColor, popupContent);
}

var cat1Layer = new L.GeoJSON.AJAX(acoesUrl, {
    filter: function (feature, layer) {
        return feature.properties.categoria === "Acesso à Justiça e Combate às Desigualdades"
    },
    pointToLayer: pointToLayer
});
var cluster1Layer = new L.markerClusterGroup();
cat1Layer.on('data:loaded', function () {
    cluster1Layer.addLayer(cat1Layer)
    map.spin(false);
});

var cat2Layer = new L.GeoJSON.AJAX(acoesUrl, {
    filter: function (feature, layer) {
        return feature.properties.categoria === "Planejamento Urbano, Gestão de Riscos e Responsabilidade Climática"
    },
    pointToLayer: pointToLayer
});
var cluster2Layer = new L.markerClusterGroup();
cat2Layer.on('data:loaded', function () {
    cluster2Layer.addLayer(cat2Layer)
    map.spin(false);
});

var cat3Layer = new L.GeoJSON.AJAX(acoesUrl, {
    filter: function (feature, layer) {
        return feature.properties.categoria === "Comunicação, Inclusão Digital e Educação Popular"
    },
    pointToLayer: pointToLayer
});
var cluster3Layer = new L.markerClusterGroup();
cat3Layer.on('data:loaded', function () {
    cluster3Layer.addLayer(cat3Layer)
    map.spin(false);
});

var cat4Layer = new L.GeoJSON.AJAX(acoesUrl, {
    filter: function (feature, layer) {
        return feature.properties.categoria === "Cultura e Memória"
    },
    pointToLayer: pointToLayer
});
var cluster4Layer = new L.markerClusterGroup();
cat4Layer.on('data:loaded', function () {
    cluster4Layer.addLayer(cat4Layer)
    map.spin(false);
});

var cat5Layer = new L.GeoJSON.AJAX(acoesUrl, {
    filter: function (feature, layer) {
        return feature.properties.categoria === "Saúde Integral e Dignidade Humana"
    },
    pointToLayer: pointToLayer
});
var cluster5Layer = new L.markerClusterGroup();
cat5Layer.on('data:loaded', function () {
    cluster5Layer.addLayer(cat5Layer)
    map.spin(false);
});

var cat6Layer = new L.GeoJSON.AJAX(acoesUrl, {
    filter: function (feature, layer) {
        return feature.properties.categoria === "Soberania Alimentar e Nutricional"
    },
    pointToLayer: pointToLayer
});
var cluster6Layer = new L.markerClusterGroup();
cat6Layer.on('data:loaded', function () {
    cluster6Layer.addLayer(cat6Layer)
    map.spin(false);
});

var cat7Layer = new L.GeoJSON.AJAX(acoesUrl, {
    filter: function (feature, layer) {
        return feature.properties.categoria === "Economia Solidária"
    },
    pointToLayer: pointToLayer
});
var cluster7Layer = new L.markerClusterGroup();
cat7Layer.on('data:loaded', function () {
    cluster7Layer.addLayer(cat7Layer)
    map.spin(false);
});

const clustersAndProperties = [];

const clustersPremiumAndProperties = [];

Object.entries(categoryMappings).forEach(([category, properties], index) => {
    const catLayer = new L.GeoJSON.AJAX(acoesUrl, {
        filter: function (feature, layer) {
            return feature.properties.categoria === category;
        },
        pointToLayer: pointToLayer
    });

    const clusterLayer = new L.markerClusterGroup();

    catLayer.on('data:loaded', function () {
        clusterLayer.addLayer(catLayer);
        map.spin(false);
    });

    clustersAndProperties.push({category, clusterLayer, properties});
});

Object.entries(categoryMappings).forEach(([category, properties], index) => {
    const catLayer = new L.GeoJSON.AJAX(acoesUrl, {
        filter: function (feature, layer) {
            return (feature.properties.categoria === category && feature.properties.premiado === true)
        },
        pointToLayer: pointToLayer
    });

    const clusterLayer = new L.markerClusterGroup();

    catLayer.on('data:loaded', function () {
        clusterLayer.addLayer(catLayer);
        map.spin(false);
    });

    clustersPremiumAndProperties.push({category, clusterLayer, properties});
});

const baseLayers = [
    {
        id: 1,
        description: 'OpenStreetMap',
        lyr: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 21,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }),
        active: true
    },
    {
        id: 2,
        description: 'Google Streets',
        lyr: L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            maxZoom: 21,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: '&copy; <a href="https://www.google.com/intl/pt-BR/help/terms_maps/">Google</a>'
        }),
        active: false
    },
    {
        id: 3,
        description: 'Google Satélite',
        lyr: L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            maxZoom: 21,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: '&copy; <a href="https://www.google.com/intl/pt-BR/help/terms_maps/">Google</a>'
        }),
        active: false
    },
];

const overlayLayers = [
    {
        id: 0,
        description: clustersAndProperties[0].category,
        lyr: clustersAndProperties[0].clusterLayer,
        iconClass: clustersAndProperties[0].properties.iconClass,
        markerColor: clustersAndProperties[0].properties.markerColor,
        active: true
    },
    {
        id: 1,
        description: clustersAndProperties[1].category,
        lyr: clustersAndProperties[1].clusterLayer,
        iconClass: clustersAndProperties[1].properties.iconClass,
        markerColor: clustersAndProperties[1].properties.markerColor,
        active: true
    },
    {
        id: 2,
        description: clustersAndProperties[2].category,
        lyr: clustersAndProperties[2].clusterLayer,
        iconClass: clustersAndProperties[2].properties.iconClass,
        markerColor: clustersAndProperties[2].properties.markerColor,
        active: true
    },
    {
        id: 3,
        description: clustersAndProperties[3].category,
        lyr: clustersAndProperties[3].clusterLayer,
        iconClass: clustersAndProperties[3].properties.iconClass,
        markerColor: clustersAndProperties[3].properties.markerColor,
        active: true
    },
    {
        id: 4,
        description: clustersAndProperties[4].category,
        lyr: clustersAndProperties[4].clusterLayer,
        iconClass: clustersAndProperties[4].properties.iconClass,
        markerColor: clustersAndProperties[4].properties.markerColor,
        active: true
    },
    {
        id: 5,
        description: clustersAndProperties[5].category,
        lyr: clustersAndProperties[5].clusterLayer,
        iconClass: clustersAndProperties[5].properties.iconClass,
        markerColor: clustersAndProperties[5].properties.markerColor,
        active: true
    },
    {
        id: 6,
        description: clustersAndProperties[6].category,
        lyr: clustersAndProperties[6].clusterLayer,
        iconClass: clustersAndProperties[6].properties.iconClass,
        markerColor: clustersAndProperties[6].properties.markerColor,
        active: true
    },

];

const premiumOverlayLayers = [
    {
        id: 0,
        description: clustersPremiumAndProperties[0].category,
        lyr: clustersPremiumAndProperties[0].clusterLayer,
        iconClass: clustersPremiumAndProperties[0].properties.iconClass,
        markerColor: clustersPremiumAndProperties[0].properties.markerColor,
        active: true
    },
    {
        id: 1,
        description: clustersPremiumAndProperties[1].category,
        lyr: clustersPremiumAndProperties[1].clusterLayer,
        iconClass: clustersPremiumAndProperties[1].properties.iconClass,
        markerColor: clustersPremiumAndProperties[1].properties.markerColor,
        active: true
    },
    {
        id: 2,
        description: clustersPremiumAndProperties[2].category,
        lyr: clustersPremiumAndProperties[2].clusterLayer,
        iconClass: clustersPremiumAndProperties[2].properties.iconClass,
        markerColor: clustersPremiumAndProperties[2].properties.markerColor,
        active: true
    },
    {
        id: 3,
        description: clustersPremiumAndProperties[3].category,
        lyr: clustersPremiumAndProperties[3].clusterLayer,
        iconClass: clustersPremiumAndProperties[3].properties.iconClass,
        markerColor: clustersPremiumAndProperties[3].properties.markerColor,
        active: true
    },
    {
        id: 4,
        description: clustersPremiumAndProperties[4].category,
        lyr: clustersPremiumAndProperties[4].clusterLayer,
        iconClass: clustersPremiumAndProperties[4].properties.iconClass,
        markerColor: clustersPremiumAndProperties[4].properties.markerColor,
        active: true
    },
    {
        id: 5,
        description: clustersPremiumAndProperties[5].category,
        lyr: clustersPremiumAndProperties[5].clusterLayer,
        iconClass: clustersPremiumAndProperties[5].properties.iconClass,
        markerColor: clustersPremiumAndProperties[5].properties.markerColor,
        active: true
    },
    {
        id: 6,
        description: clustersPremiumAndProperties[6].category,
        lyr: clustersPremiumAndProperties[6].clusterLayer,
        iconClass: clustersPremiumAndProperties[6].properties.iconClass,
        markerColor: clustersPremiumAndProperties[6].properties.markerColor,
        active: true
    },
];


var caravanasUrl = $('#caravanas_geojson').val();


var redMarker = L.AwesomeMarkers.icon({
    prefix: 'fa',
    icon: 'fa-van-shuttle',
    markerColor: 'purple'
});

const caravanasLayer = new L.GeoJSON.AJAX(caravanasUrl, {
    pointToLayer: function (feature, latlng) {

        let dateTime = new Date(feature.properties.data);
        let options = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            // hour: 'numeric',
            // minute: 'numeric',
            // second: 'numeric',
            // timeZoneName: 'short',
            timeZone: 'America/Sao_Paulo',
        };
        let brazilianDateTime = dateTime.toLocaleString('pt-BR', options);

        let marker = L.marker(latlng, {icon: redMarker});
        let popupContent = `<span>Território Periférico:</span>${feature.properties.territorio_periferico}
                              <span>Caravana:</span>${feature.properties.caravana}
                              <span>Data:</span>${brazilianDateTime}
                            `;
        marker.bindPopup(popupContent);
        return marker;
    },
});

const caravanasCluster = new L.markerClusterGroup();

caravanasLayer.on('data:loaded', function () {
    caravanasCluster.addLayer(caravanasLayer)
    map.spin(false);
});

const caravanasArr = [
    {
        id: 1,
        description: 'Caravana das Periferias',
        lyr: caravanasCluster,
        iconClass: 'fa fa-van-shuttle',
        markerColor: "purple",
        active: true
    },

]