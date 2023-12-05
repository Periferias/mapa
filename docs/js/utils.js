var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})

var zoomHome = L.Control.zoomHome({
    zoomHomeTitle: 'Zoom Inicial',
    zoomHomeIcon: 'magnifying-glass',

    // position: 'topright',
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

const geoServerUrl = 'https://geoserver.multisig.com.br/geoserver/'

const americaSul = L.tileLayer.wms(geoServerUrl + 'geofazendas/wms?', {
    format: 'image/png',
    transparent: true,
    version: '1.1.0',
    maxZoom: 22,
    zIndex: 10,
    opacity: 0.9,
    layers: 'geofazendas:america_sul',
    attribution: '&copy; <a href="https://www.ibge.gov.br/">IBGE</a>',
});
const agsn = L.tileLayer.wms(geoServerUrl + 'ambiental/wms?', {
    format: 'image/png',
    transparent: true,
    version: '1.1.0',
    maxZoom: 22,
    zIndex: 10,
    opacity: 0.9,
    layers: 'ambiental:agsn',
    minZoom: 10,
    attribution: '&copy; <a href="https://www.ibge.gov.br/">IBGE</a>',
});


const agsnContorno = L.tileLayer.wms(geoServerUrl + 'ambiental/wms?', {
    format: 'image/png',
    transparent: true,
    version: '1.1.0',
    maxZoom: 22,
    zIndex: 10,
    opacity: 0.9,
    styles: 'ambiental:agsn_cortorno',
    layers: 'ambiental:agsn',
    attribution: '&copy; <a href="https://www.ibge.gov.br/">IBGE</a>',
});


const intraUrbana = L.tileLayer.wms(geoServerUrl + 'ambiental/wms?', {
    format: 'image/png',
    transparent: true,
    version: '1.1.0',
    maxZoom: 22,
    zIndex: 10,
    opacity: 0.9,
    layers: 'ambiental:tipologia_intraurbana',
    attribution: '&copy; <a href="https://www.ibge.gov.br/">IBGE</a>',
});

var limitsBr = L.geoJson(
    limiteBr, {
        style: {
            "color": "#000",
            "weight": 1.7,
            "opacity": 0.8
        },
    });

var acoesUrl = $('#acoes_geojson').val();
var pacUrl = $('#pac_geojson').val();

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
                        <span>Premiado:</span>${feature.properties.premiado ? 'Sim' : 'Não'}
                        <span>Município/Estado:</span>${feature.properties.municipio}/${feature.properties.estado}
                       `

    var {iconClass, markerColor} = categoryMappings[category] || {
        iconClass: "fa-question",
        markerColor: "gray"
    };
    return createMarker(latlng, iconClass, markerColor, popupContent);
}

const clustersAndProperties = [];

const clustersPremiumAndProperties = [];

Object.entries(categoryMappings).forEach(([category, properties], index) => {
    const catLayer = new L.GeoJSON.AJAX(acoesUrl, {
        filter: function (feature, layer) {
            return feature.properties.categoria === category;
        },
        pointToLayer: pointToLayer
    });

    const clusterLayer = new L.markerClusterGroup({chunkedLoading: true});

    catLayer.on('data:loaded', function () {
        clusterLayer.addLayer(catLayer);
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

    const clusterLayer = new L.markerClusterGroup({chunkedLoading: true});

    catLayer.on('data:loaded', function () {
        clusterLayer.addLayer(catLayer);
    });

    clustersPremiumAndProperties.push({category, clusterLayer, properties});
});

const baseLayers = [
    {
        id: 4,
        description: 'Carto Light',
        lyr: L.tileLayer('https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.pn', {
            maxZoom: 21,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: '&copy; <a href="https://carto.com/">CartoDB</a>'
        }),
        active: true
    },
    {
        id: 1,
        description: 'OpenStreetMap',
        lyr: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 21,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }),
        active: false
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

const caravanasCluster = new L.markerClusterGroup({chunkedLoading: true});

caravanasLayer.on('data:loaded', function () {
    caravanasCluster.addLayer(caravanasLayer)
});


var pacMappings = {
    "Obras de contenção de encostas": {
        iconClass: "fa-mountain-city",
        markerColor: "darkgreen"
    },
    "Urbanização": {
        iconClass: "fa-building",
        markerColor: "red"
    },
};

const enconstasLayer = new L.GeoJSON.AJAX(pacUrl, {
    filter: function (feature, layer) {
        if (feature.properties.modalidade === 'Obras de contenção de encostas') {
            return true
        }
    },
    pointToLayer: function (feature, latlng) {
        const category = feature.properties.modalidade;

        const popupContent = `<span>Código SACI:</span>${feature.properties.codigo_saci}
                              <span>Modalidade:</span>${feature.properties.modalidade}
                              <span>Programa:</span>${feature.properties.programa}
                              <span>Fonte:</span>${feature.properties.fonte}
                              <span>Municípios Beneficiados:</span>${feature.properties.municipios_beneficiados}
                              <span>Estado</span>${feature.properties.uf}
                              <span>Obs:</span> Sede municipal (IBGE) - não corresponde ao local da obra.
                            `

        const {iconClass, markerColor} = pacMappings[category] || {iconClass: "fa-question", markerColor: "gray"};
        return createMarker(latlng, iconClass, markerColor, popupContent);
    }
});

const encostasCluster = new L.markerClusterGroup();
enconstasLayer.on('data:loaded', function () {
    encostasCluster.addLayer(enconstasLayer);
});

const urbanizacaoLayer = new L.GeoJSON.AJAX(pacUrl, {
    filter: function (feature, layer) {
        if (feature.properties.modalidade === 'Urbanização') {
            return true
        }
    },
    pointToLayer: function (feature, latlng) {
        const category = feature.properties.modalidade;

        const popupContent = `<span>Código SACI:</span>${feature.properties.codigo_saci}
                              <span>Modalidade:</span>${feature.properties.modalidade}
                              <span>Programa:</span>${feature.properties.programa}
                              <span>Fonte:</span>${feature.properties.fonte}
                              <span>Municípios Beneficiados:</span>${feature.properties.municipios_beneficiados}
                              <span>Estado</span>${feature.properties.uf}
                            `
        const {iconClass, markerColor} = pacMappings[category] || {iconClass: "fa-question", markerColor: "gray"};
        return createMarker(latlng, iconClass, markerColor, popupContent);
    }
});

const urbanizacaoCluster = new L.markerClusterGroup();
urbanizacaoLayer.on('data:loaded', function () {
    urbanizacaoCluster.addLayer(urbanizacaoLayer);
});

const pacArr = [
    {
        id: 1,
        description: 'Urbanização',
        lyr: urbanizacaoCluster,
        iconClass: 'fa fa-building',
        markerColor: "red",
        active: false
    },
    {
        id: 2,
        description: 'Contenção de Encostas',
        lyr: encostasCluster,
        iconClass: 'fa fa-mountain-city',
        markerColor: "darkgreen",
        active: false
    },
];
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

const vulnerabilityArr = [
    {
        id: 1,
        description: 'Aglomerados Subnormais (IBGE)',
        lyr: agsn,
        iconClass: 'fa fa-eye',
        markerColor: "",
        active: false
    },
    {
        id: 2,
        description: 'Tipologia IntraUrbana',
        lyr: intraUrbana,
        iconClass: 'fa fa-eye',
        markerColor: "",
        active: false
    }
]



