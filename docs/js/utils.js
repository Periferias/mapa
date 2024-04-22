function string_to_slug(str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    var from = "àáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to = "aaaaaeeeeiiiioooouuuunc------";

    for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
}

const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})

const geoServerWmsUrl = GEOSERVER_URL + 'mapa_periferias/wms?'

function getWfsUrl(layer) {
    let domain = GEOSERVER_URL;
    let basePath = 'mapa_periferias/ows';
    const params = new URLSearchParams({
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: `${layer}`,
        outputFormat: 'application/json'
    });
    return `${domain}${basePath}?${params.toString()}`;
}

const periferiaVivaUrl = getWfsUrl('mapa_periferias:iniciativa_periferia_viva');
const redusUrl = getWfsUrl('mapa_periferias:iniciativa_redus');
const pacUrl = getWfsUrl('mapa_periferias:pac');
const caravanasUrl = getWfsUrl('mapa_periferias:caravanas');
const pmrrMunUrl = getWfsUrl('mapa_periferias:pmrr_mun');
const pmrrCenUrl = getWfsUrl('mapa_periferias:centroid_pmrr_mun');

const zoomHome = L.Control.zoomHome({
    zoomHomeTitle: 'Zoom Inicial',
    zoomHomeIcon: 'earth-americas',
});

const coordinates = L.control.coordinates({
    enableUserInput: false,
    useDMS: true,
    position: 'bottomleft',
    decimals: 5,
    decimalSeperator: ",",
    labelTemplateLng: "Long: {x}",
    labelTemplateLat: "Lat: {y}"
});


const americaSul = L.tileLayer.wms(geoServerWmsUrl, {
    format: 'image/png',
    transparent: true,
    version: '1.1.0',
    maxZoom: 22,
    zIndex: 1,
    opacity: 0.9,
    layers: 'mapa_periferias:america_sul',
    attribution: '&copy; <a href="https://www.ibge.gov.br/">IBGE</a>',
});
const agsn = L.tileLayer.wms(geoServerWmsUrl, {
    format: 'image/png',
    transparent: true,
    version: '1.1.0',
    maxZoom: 22,
    zIndex: 100,
    opacity: 0.9,
    styles: 'mapa_periferias:agsn',
    layers: 'mapa_periferias:agsn',
    minZoom: 10,
    attribution: '&copy; <a href="https://www.ibge.gov.br/">IBGE</a>',
});
const agsnContorno = L.tileLayer.wms(geoServerWmsUrl, {
    format: 'image/png',
    transparent: true,
    version: '1.1.0',
    maxZoom: 22,
    zIndex: 1000,
    opacity: 0.9,
    styles: 'mapa_periferias:agsn_cortorno',
    layers: 'mapa_periferias:agsn',
    attribution: '&copy; <a href="https://www.ibge.gov.br/">IBGE</a>',
});
const intraUrbana = L.tileLayer.wms(geoServerWmsUrl, {
    format: 'image/png',
    transparent: true,
    version: '1.1.0',
    maxZoom: 22,
    zIndex: 1,
    opacity: 0.9,
    layers: 'mapa_periferias:tipologia_intraurbana',
    attribution: '&copy; <a href="https://www.ibge.gov.br/">IBGE</a>',
});
const pmrrMun = L.tileLayer.wms(geoServerWmsUrl, {
    format: 'image/png',
    transparent: true,
    version: '1.1.0',
    maxZoom: 22,
    zIndex: 10,
    opacity: 0.9,
    layers: 'mapa_periferias:pmrr_mun',
    attribution: '&copy; <a href="https://www.ibge.gov.br/">IBGE</a>',
});

const limitsBr = L.geoJson(
    limiteBr, {
        style: {
            "color": "#000",
            "weight": 1.7,
            "opacity": 0.8
        },
    });


const LeafIcon = L.Icon.extend({
    options: {
        iconSize: [30, 46],
        shadowSize: [50, 64],
        iconAnchor: [20, 64],
        shadowAnchor: [4, 62],
        popupAnchor: [-5, -56]
    }
});

const pinAlimentacao = new LeafIcon({iconUrl: 'pins/alimentacao.svg'});
const pinComunicacao = new LeafIcon({iconUrl: 'pins/comunicacao.svg'});
const pinCultura = new LeafIcon({iconUrl: 'pins/cultura.svg'});
const pinEconomia = new LeafIcon({iconUrl: 'pins/economia.svg'});
const pinHabitacao = new LeafIcon({iconUrl: 'pins/habitacao.svg'});
const pinSaude = new LeafIcon({iconUrl: 'pins/saude.svg'});
const pinJustica = new LeafIcon({iconUrl: 'pins/justica.svg'});

const categoryMappings = {
    "Acesso à Justiça e Combate às Desigualdades": {
        iconClass: pinJustica
    },
    "Planejamento Urbano, Gestão de Riscos e Responsabilidade Climática": {
        iconClass: pinHabitacao
    },
    "Comunicação, Inclusão Digital e Educação Popular": {
        iconClass: pinComunicacao
    },
    "Cultura e Memória": {
        iconClass: pinCultura
    },
    "Saúde Integral e Dignidade Humana": {
        iconClass: pinSaude
    },
    "Soberania Alimentar e Nutricional": {
        iconClass: pinAlimentacao
    },
    "Economia Solidária": {
        iconClass: pinEconomia
    },
};

function createMarker(latlng, iconClass, markerColor, popupContent) {
    return L.marker(latlng, {
        icon: iconClass,
    }).bindPopup(popupContent);
}

function pointToLayer(feature, latlng) {
    let category = feature.properties.categoria;


    let popupContent = `<span>Organização:</span>${feature.properties.organizacao}
                        <span>Categoria:</span>${feature.properties.categoria}
                        <span>Localidade:</span>${feature.properties.localidade}
                        ${feature.properties.premiado ? '<span>Premiado:</span>Sim' : ''}
                        <span>Município/Estado:</span>${feature.properties.municipio_cadastro}/${feature.properties.uf}
                       `

    let {iconClass, markerColor} = categoryMappings[category] || {
        iconClass: "fa-question",
        markerColor: "gray"
    };
    return createMarker(latlng, iconClass, markerColor, popupContent);
}

const clustersAndProperties = [];

const clustersPremiumAndProperties = [];

Object.entries(categoryMappings).forEach(([category, properties], index) => {
    let catLayer = new L.GeoJSON.AJAX(periferiaVivaUrl, {
        filter: function (feature, layer) {
            return feature.properties.categoria === category;
        },
        pointToLayer: pointToLayer
    });

    let clusterLayer = new L.markerClusterGroup({chunkedLoading: true});

    catLayer.on('data:loaded', function () {
        clusterLayer.addLayer(catLayer);
    });

    clustersAndProperties.push({category, clusterLayer, properties});
});

Object.entries(categoryMappings).forEach(([category, properties], index) => {
    let catLayer = new L.GeoJSON.AJAX(periferiaVivaUrl, {
        filter: function (feature, layer) {
            return (feature.properties.categoria === category && feature.properties.premiado === true)
        },
        pointToLayer: pointToLayer
    });

    let clusterLayer = new L.markerClusterGroup({chunkedLoading: true});

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

const periferiaLayers = [
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

const premiadoLayers = [
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


const redMarker = L.AwesomeMarkers.icon({
    prefix: 'fa',
    icon: 'fa-van-shuttle',
    markerColor: 'purple'
});

const caravanasLayer = new L.GeoJSON.AJAX(caravanasUrl, {
    pointToLayer: function (feature, latlng) {
        let marker = L.marker(latlng, {icon: redMarker});
        let popupContent = `<span>Território Periférico:</span>${feature.properties.territorio}
                              <span>Caravana:</span>${feature.properties.caravana}
                              <span>Visitada em:</span>${feature.properties.data}
                            `;
        marker.bindPopup(popupContent);
        return marker;
    },
});

const caravanasCluster = new L.markerClusterGroup({chunkedLoading: true});

caravanasLayer.on('data:loaded', function () {
    caravanasCluster.addLayer(caravanasLayer)
});


function createPacMarker(latlng, iconClass, markerColor, popupContent) {
    return L.marker(latlng, {
        icon: L.AwesomeMarkers.icon({
            prefix: 'fa',
            icon: iconClass,
            markerColor: markerColor,
        }),
    }).bindPopup(popupContent);
}

const pacMappings = {
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
        let category = feature.properties.modalidade;

        let popupContent = `<span>Código SACI:</span>${feature.properties.codigo_saci}
                              <span>Modalidade:</span>${feature.properties.modalidade}
                              <span>Programa:</span>${feature.properties.programa}
                              <span>Fonte:</span>${feature.properties.fonte}
                              <span>Municípios Beneficiados:</span>${feature.properties.municipios_beneficiados}
                              <span>Estado</span>${feature.properties.uf}
                              <span>Obs:</span> Sede municipal (IBGE) - não corresponde ao local da obra.
                            `

        let {iconClass, markerColor} = pacMappings[category] || {iconClass: "fa-question", markerColor: "gray"};
        return createPacMarker(latlng, iconClass, markerColor, popupContent);
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
        let category = feature.properties.modalidade;

        let popupContent = `<span>Código SACI:</span>${feature.properties.codigo_saci}
                              <span>Modalidade:</span>${feature.properties.modalidade}
                              <span>Programa:</span>${feature.properties.programa}
                              <span>Fonte:</span>${feature.properties.fonte}
                              <span>Municípios Beneficiados:</span>${feature.properties.municipios_beneficiados}
                              <span>Estado</span>${feature.properties.uf}
                            `
        let {iconClass, markerColor} = pacMappings[category] || {iconClass: "fa-question", markerColor: "gray"};
        return createPacMarker(latlng, iconClass, markerColor, popupContent);
    }
});

const urbanizacaoCluster = new L.markerClusterGroup();
urbanizacaoLayer.on('data:loaded', function () {
    urbanizacaoCluster.addLayer(urbanizacaoLayer);
});

const centroidPmrr_Layer = new L.GeoJSON.AJAX(pmrrCenUrl, {
    pointToLayer: function (feature, latlng) {
        let status = feature.properties.status
        let statusStyle;
        if (status === 'Em andamento') {
            statusStyle = {
                fillColor: '#c51b7d',
                color: '#ffffff',
                fillOpacity: 0.7,
            };
        } else {
            statusStyle = {
                fillColor: '#0053ba',
                color: '#ffffff',
                fillOpacity: 0.7,
            };
        }
        statusStyle.radius = 10;
        let marker = L.circleMarker(latlng, statusStyle);
        let popupContent = `<span>Município:</span>${feature.properties.nm_mun} - ${feature.properties.sigla_uf}
                              <span>Universidade:</span>${feature.properties.universida}
                              <span>Coordenador:</span>${feature.properties.coordenado}
                              <span>Decreto do Comitê Gestor:</span>${feature.properties.decreto}
                              <span>Secretaria Âncora:</span>${feature.properties.secretaria}
                              <span>Previsão de finalização</span>${feature.properties.previsao_f}
                              <span>Status</span>${feature.properties.status}
                            `
        marker.bindPopup(popupContent);
        return marker;
    }
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

const pmrrArr = [
    {
        id: 1,
        description: 'PMRR - Centróides',
        lyr: centroidPmrr_Layer,
        iconClass: 'fa fa-eye',
        markerColor: "",
        active: false
    },
    {
        id: 2,
        description: 'PMRR - Municípios',
        lyr: pmrrMun,
        iconClass: 'fa fa-eye',
        markerColor: "",
        active: false
    },
]

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
        description: 'Favelas e Comunidades Urbanas',
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

// ------------------ REDuS -------------------------------

const redusMappings = {
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

function createRedusMarker(latlng, iconClass, markerColor, popupContent) {
    return L.marker(latlng, {
        icon: L.AwesomeMarkers.icon({
            prefix: 'fa',
            icon: iconClass,
            markerColor: markerColor,
        }),
    }).bindPopup(popupContent);
}

function pointRedusToLayer(feature, latlng) {
    let category = feature.properties.categoria;

    let popupContent = `<span>Organização:</span>${feature.properties.organizacao}
                        <span>Categoria:</span>${feature.properties.categoria}
                        <span>Localidade:</span>${feature.properties.localidade}
                        ${feature.properties.premiado ? '<span>Premiado:</span>Sim' : ''}
                        <span>Município/Estado:</span>${feature.properties.municipio_cadastro}/${feature.properties.uf}
                       `

    let {iconClass, markerColor} = redusMappings[category] || {
        iconClass: "fa-question",
        markerColor: "gray"
    };
    return createRedusMarker(latlng, iconClass, markerColor, popupContent);
}

const redusClustersAndProperties = [];

Object.entries(redusMappings).forEach(([category, properties], index) => {
    let catLayer = new L.GeoJSON.AJAX(redusUrl, {
        filter: function (feature, layer) {
            return feature.properties.categoria === category;
        },
        pointToLayer: pointRedusToLayer
    });

    let clusterLayer = new L.markerClusterGroup({chunkedLoading: true});

    catLayer.on('data:loaded', function () {
        clusterLayer.addLayer(catLayer);
    });

    redusClustersAndProperties.push({category, clusterLayer, properties});
});


const redusArr = [
    {
        id: 0,
        description: redusClustersAndProperties[0].category,
        lyr: redusClustersAndProperties[0].clusterLayer,
        iconClass: redusClustersAndProperties[0].properties.iconClass,
        markerColor: redusClustersAndProperties[0].properties.markerColor,
        active: false
    },
    {
        id: 1,
        description: redusClustersAndProperties[1].category,
        lyr: redusClustersAndProperties[1].clusterLayer,
        iconClass: redusClustersAndProperties[1].properties.iconClass,
        markerColor: redusClustersAndProperties[1].properties.markerColor,
        active: false
    },
    {
        id: 2,
        description: redusClustersAndProperties[2].category,
        lyr: redusClustersAndProperties[2].clusterLayer,
        iconClass: redusClustersAndProperties[2].properties.iconClass,
        markerColor: redusClustersAndProperties[2].properties.markerColor,
        active: false
    },
    {
        id: 3,
        description: redusClustersAndProperties[3].category,
        lyr: redusClustersAndProperties[3].clusterLayer,
        iconClass: redusClustersAndProperties[3].properties.iconClass,
        markerColor: redusClustersAndProperties[3].properties.markerColor,
        active: false
    },
    {
        id: 4,
        description: redusClustersAndProperties[4].category,
        lyr: redusClustersAndProperties[4].clusterLayer,
        iconClass: redusClustersAndProperties[4].properties.iconClass,
        markerColor: redusClustersAndProperties[4].properties.markerColor,
        active: false
    },
    {
        id: 5,
        description: redusClustersAndProperties[5].category,
        lyr: redusClustersAndProperties[5].clusterLayer,
        iconClass: redusClustersAndProperties[5].properties.iconClass,
        markerColor: redusClustersAndProperties[5].properties.markerColor,
        active: false
    },
    {
        id: 6,
        description: redusClustersAndProperties[6].category,
        lyr: redusClustersAndProperties[6].clusterLayer,
        iconClass: redusClustersAndProperties[6].properties.iconClass,
        markerColor: redusClustersAndProperties[6].properties.markerColor,
        active: false
    },
];