function string_to_slug(str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
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

// Links das camadas no GeoServer
const periferiaVivaUrl = getWfsUrl('mapa_periferias:iniciativa_periferia_viva');
const redusUrl = getWfsUrl('mapa_periferias:iniciativa_redus');
const pacUrl = getWfsUrl('mapa_periferias:pac');
const pacUrb58Url = getWfsUrl('mapa_periferias:pac_urb_58');
const pacEncostasUrl = getWfsUrl('mapa_periferias:pac_encostas');
const pacRegularizacaoUrl = getWfsUrl('mapa_periferias:pac_regularizacao');
const caravanasUrl = getWfsUrl('mapa_periferias:caravanas');
const infoDoacaoUrl = getWfsUrl('mapa_periferias:info_doacao_rgs');
const pmrrMunUrl = getWfsUrl('mapa_periferias:pmrr_mun');
const exemploUrl = getWfsUrl('mapa_periferias:exemplo');

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

const limitsBr = L.geoJson(
    limiteBr, {
        style: {
            "color": "#000",
            "weight": 1.7,
            "opacity": 0.8
        },
    });

const baseLayers = [
    {
        id: 4,
        description: 'Carto Light',
        lyr: L.tileLayer('https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.pn', {
            maxZoom: 21,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap & CartoDB</a>'
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
const pinPontoColeta = new LeafIcon({iconUrl: 'pins/coleta.svg'});

const parentGroup = new L.markerClusterGroup(
    {
        maxClusterRadius: 60,
        polygonOptions: {
            fillColor: '#66ff00',
            color: '#066423',
            weight: 0.5,
            opacity: 1,
            fillOpacity: 0.5
        }
    }
);
const periferia0 = L.featureGroup.subGroup(parentGroup);
const periferia1 = L.featureGroup.subGroup(parentGroup);
const periferia2 = L.featureGroup.subGroup(parentGroup);
const periferia3 = L.featureGroup.subGroup(parentGroup);
const periferia4 = L.featureGroup.subGroup(parentGroup);
const periferia5 = L.featureGroup.subGroup(parentGroup);
const periferia6 = L.featureGroup.subGroup(parentGroup);

const premio0 = L.featureGroup.subGroup(parentGroup);
const premio1 = L.featureGroup.subGroup(parentGroup);
const premio2 = L.featureGroup.subGroup(parentGroup);
const premio3 = L.featureGroup.subGroup(parentGroup);
const premio4 = L.featureGroup.subGroup(parentGroup);
const premio5 = L.featureGroup.subGroup(parentGroup);
const premio6 = L.featureGroup.subGroup(parentGroup);

const regusG0 = L.featureGroup.subGroup(parentGroup);
const regusG1 = L.featureGroup.subGroup(parentGroup);
const regusG2 = L.featureGroup.subGroup(parentGroup);
const regusG3 = L.featureGroup.subGroup(parentGroup);
const regusG4 = L.featureGroup.subGroup(parentGroup);
const regusG5 = L.featureGroup.subGroup(parentGroup);
const regusG6 = L.featureGroup.subGroup(parentGroup);

const caravana2023Group = L.featureGroup.subGroup(parentGroup);
const caravana2024Group = L.featureGroup.subGroup(parentGroup);
const pacUrbGroup = L.featureGroup.subGroup(parentGroup);
const pacEncGroup = L.featureGroup.subGroup(parentGroup);

// ----------- novo pac --------------
const pacUrb58Group = L.featureGroup.subGroup(parentGroup);
const pacEncostasGroup = L.featureGroup.subGroup(parentGroup);
const pacRegularizacaoGroup = L.featureGroup.subGroup(parentGroup);

const infoDoacaoPixGroup = L.featureGroup.subGroup(parentGroup);
const infoDoacaoLocalGroup = L.featureGroup.subGroup(parentGroup);
const clustersAndProperties = [];
const clustersPremiumAndProperties = [];

// -- SubGrupo Exemplo
const exemploGroup = L.featureGroup.subGroup(parentGroup);


const categoryMappings = {
    "Acesso à Justiça e Combate às Desigualdades": {
        iconClass: pinJustica,
        group: periferia0,
        premioGroup: premio0,
    },
    "Planejamento Urbano, Gestão de Riscos e Responsabilidade Climática": {
        iconClass: pinHabitacao,
        group: periferia1,
        premioGroup: premio1,
    },
    "Comunicação, Inclusão Digital e Educação Popular": {
        iconClass: pinComunicacao,
        group: periferia2,
        premioGroup: premio2,
    },
    "Cultura e Memória": {
        iconClass: pinCultura,
        group: periferia3,
        premioGroup: premio3,
    },
    "Saúde Integral e Dignidade Humana": {
        iconClass: pinSaude,
        group: periferia4,
        premioGroup: premio4,
    },
    "Soberania Alimentar e Nutricional": {
        iconClass: pinAlimentacao,
        group: periferia5,
        premioGroup: premio5,
    },
    "Economia Solidária": {
        iconClass: pinEconomia,
        group: periferia6,
        premioGroup: premio6,
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

Object.entries(categoryMappings).forEach(([category, properties], index) => {
    let catLayer = new L.GeoJSON.AJAX(periferiaVivaUrl, {
        filter: function (feature, layer) {
            return feature.properties.categoria === category;
        },
        pointToLayer: pointToLayer
    });
    catLayer.on('data:loaded', function () {
        properties.group.addLayer(catLayer);
    });

    clustersAndProperties.push({category, periferiaGroup: properties.group, properties});
});

Object.entries(categoryMappings).forEach(([category, properties], index) => {
    let catLayer = new L.GeoJSON.AJAX(periferiaVivaUrl, {
        filter: function (feature, layer) {
            return (feature.properties.categoria === category && feature.properties.premiado === true)
        },
        pointToLayer: pointToLayer
    });
    catLayer.on('data:loaded', function () {
        properties.premioGroup.addLayer(catLayer);
    });
    clustersPremiumAndProperties.push({category, premiadoGroup: properties.premioGroup, properties});
});

const periferiaLayers = [
    {
        id: 0,
        description: clustersAndProperties[0].category,
        lyr: clustersAndProperties[0].periferiaGroup,
        iconClass: clustersAndProperties[0].properties.iconClass,
        markerColor: clustersAndProperties[0].properties.markerColor,
        active: false
    },
    {
        id: 1,
        description: clustersAndProperties[1].category,
        lyr: clustersAndProperties[1].periferiaGroup,
        iconClass: clustersAndProperties[1].properties.iconClass,
        markerColor: clustersAndProperties[1].properties.markerColor,
        active: false
    },
    {
        id: 2,
        description: clustersAndProperties[2].category,
        lyr: clustersAndProperties[2].periferiaGroup,
        iconClass: clustersAndProperties[2].properties.iconClass,
        markerColor: clustersAndProperties[2].properties.markerColor,
        active: false
    },
    {
        id: 3,
        description: clustersAndProperties[3].category,
        lyr: clustersAndProperties[3].periferiaGroup,
        iconClass: clustersAndProperties[3].properties.iconClass,
        markerColor: clustersAndProperties[3].properties.markerColor,
        active: false
    },
    {
        id: 4,
        description: clustersAndProperties[4].category,
        lyr: clustersAndProperties[4].periferiaGroup,
        iconClass: clustersAndProperties[4].properties.iconClass,
        markerColor: clustersAndProperties[4].properties.markerColor,
        active: false
    },
    {
        id: 5,
        description: clustersAndProperties[5].category,
        lyr: clustersAndProperties[5].periferiaGroup,
        iconClass: clustersAndProperties[5].properties.iconClass,
        markerColor: clustersAndProperties[5].properties.markerColor,
        active: false
    },
    {
        id: 6,
        description: clustersAndProperties[6].category,
        lyr: clustersAndProperties[6].periferiaGroup,
        iconClass: clustersAndProperties[6].properties.iconClass,
        markerColor: clustersAndProperties[6].properties.markerColor,
        active: false
    },

];

const premiadoLayers = [
    {
        id: 0,
        description: clustersPremiumAndProperties[0].category,
        lyr: clustersPremiumAndProperties[0].premiadoGroup,
        iconClass: clustersPremiumAndProperties[0].properties.iconClass,
        markerColor: clustersPremiumAndProperties[0].properties.markerColor,
        active: true
    },
    {
        id: 1,
        description: clustersPremiumAndProperties[1].category,
        lyr: clustersPremiumAndProperties[1].premiadoGroup,
        iconClass: clustersPremiumAndProperties[1].properties.iconClass,
        markerColor: clustersPremiumAndProperties[1].properties.markerColor,
        active: true
    },
    {
        id: 2,
        description: clustersPremiumAndProperties[2].category,
        lyr: clustersPremiumAndProperties[2].premiadoGroup,
        iconClass: clustersPremiumAndProperties[2].properties.iconClass,
        markerColor: clustersPremiumAndProperties[2].properties.markerColor,
        active: true
    },
    {
        id: 3,
        description: clustersPremiumAndProperties[3].category,
        lyr: clustersPremiumAndProperties[3].premiadoGroup,
        iconClass: clustersPremiumAndProperties[3].properties.iconClass,
        markerColor: clustersPremiumAndProperties[3].properties.markerColor,
        active: true
    },
    {
        id: 4,
        description: clustersPremiumAndProperties[4].category,
        lyr: clustersPremiumAndProperties[4].premiadoGroup,
        iconClass: clustersPremiumAndProperties[4].properties.iconClass,
        markerColor: clustersPremiumAndProperties[4].properties.markerColor,
        active: true
    },
    {
        id: 5,
        description: clustersPremiumAndProperties[5].category,
        lyr: clustersPremiumAndProperties[5].premiadoGroup,
        iconClass: clustersPremiumAndProperties[5].properties.iconClass,
        markerColor: clustersPremiumAndProperties[5].properties.markerColor,
        active: true
    },
    {
        id: 6,
        description: clustersPremiumAndProperties[6].category,
        lyr: clustersPremiumAndProperties[6].premiadoGroup,
        iconClass: clustersPremiumAndProperties[6].properties.iconClass,
        markerColor: clustersPremiumAndProperties[6].properties.markerColor,
        active: true
    },
];

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
                              <span>Programa:</span>Contenção de Encostas
                              <span>Fonte:</span>${feature.properties.fonte}
                              <span>Municípios Beneficiados:</span>${feature.properties.municipios_beneficiados}
                              <span>Estado</span>${feature.properties.uf}
                              <span>Obs:</span> Sede municipal (IBGE) - não corresponde ao local da obra.
                            `
        let {iconClass, markerColor} = pacMappings[category] || {iconClass: "fa-question", markerColor: "gray"};
        return createPacMarker(latlng, iconClass, markerColor, popupContent);
    }
});


enconstasLayer.on('data:loaded', function () {
    pacEncGroup.addLayer(enconstasLayer);
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

urbanizacaoLayer.on('data:loaded', function () {
    pacUrbGroup.addLayer(urbanizacaoLayer);
});


// ----------------- Novas camadas do PAC -----------------------
const pacUrb58Layer = new L.GeoJSON.AJAX(pacUrb58Url, {
    pointToLayer: function (feature, latlng) {
        let category = feature.properties.modalidade;

        let popupContent = `<img src="img/logos.png" alt="">
                              <span><strong>Periferia Viva - Urbanização de Favelas</strong></span><hr>
                              <span>Área de Intervenção:</span>${feature.properties.area_intervencao}
                              <span>Município Beneficiado:</span>${feature.properties.municipio_beneficiado}
                              <span>Estado:</span>${feature.properties.estado}
                              <span>Proponente:</span>${feature.properties.proponente}
                              <span>Obs:</span>Centro da área de intervenção.
                            `
        let {iconClass, markerColor} = pacMappings[category] || {iconClass: "fa-city", markerColor: "orange"};
        return createPacMarker(latlng, iconClass, markerColor, popupContent);
    }
});
pacUrb58Layer.on('data:loaded', function () {
    pacUrb58Group.addLayer(pacUrb58Layer);
});

const pacEncostasLayer = new L.GeoJSON.AJAX(pacEncostasUrl, {
    pointToLayer: function (feature, latlng) {
        let category = feature.properties.modalidade;

        let popupContent = `<img src="img/logos.png" alt="">
                              <span><strong>Periferia Viva - Contenção de Encostas</strong></span><hr>
                              <span>Municípios Beneficiados:</span>${feature.properties.municipios_beneficiados}
                              <span>Estado:</span>${feature.properties.uf}
                              <span>Proponente:</span>${feature.properties.proponente}
                              <span>Obs:</span> Sede municipal (IBGE) - não corresponde ao local da obra.
                            `
        let {iconClass, markerColor} = pacMappings[category] || {iconClass: "fa-mountain-city", markerColor: "red"};
        return createPacMarker(latlng, iconClass, markerColor, popupContent);
    }
});
pacEncostasLayer.on('data:loaded', function () {
    pacEncostasGroup.addLayer(pacEncostasLayer);
});

const pacRegularizacaoLayer = new L.GeoJSON.AJAX(pacRegularizacaoUrl, {
    pointToLayer: function (feature, latlng) {
        let category = feature.properties.modalidade;

        let popupContent = `<img src="img/logos.png" alt="">
                              <span><strong>Periferia Viva - Regularização Fundiária</strong></span><hr>
                              <span>Área:</span>${feature.properties.area}
                              <span>Municípios Beneficiados:</span>${feature.properties.municipio_beneficiado}
                              <span>Estado:</span>${feature.properties.uf}
                              <span>Bairro:</span>${feature.properties.bairro}
                              <span>Número de Famílias Beneficiadas:</span>${feature.properties.beneficiados}
                              <span>Proponente:</span>${feature.properties.proponente_tratado}
                              <span>Obs:</span> Sede municipal (IBGE) - não corresponde ao local da obra.
                            `
        let {iconClass, markerColor} = pacMappings[category] || {iconClass: "fa-file-circle-check", markerColor: "blue"};
        return createPacMarker(latlng, iconClass, markerColor, popupContent);
    }
});
pacRegularizacaoLayer.on('data:loaded', function () {
    pacRegularizacaoGroup.addLayer(pacRegularizacaoLayer);
});

const pmrrMun = new L.GeoJSON.AJAX(pmrrMunUrl, {
    style: function (feature) {
        let status = feature.properties.status;
        let statusStyle;
        if (status === 'Em andamento') {
            statusStyle = {
                fillColor: "#2b00ff",
                fillOpacity: 0,
                color: "#2b00ff",
                weight: 3,
                opacity: 1,
            };
        } else {
            statusStyle = {
                fillColor: "#232323",
                fillOpacity: 0,
                color: "#232323",
                weight: 3,
                opacity: 1,
            };
        }
        return statusStyle;
    },
    onEachFeature: function (feature, layer) {
        let popupContent = `<span>Município:</span>${feature.properties.nm_mun} - ${feature.properties.sigla_uf}
                              <span>Universidade:</span>${feature.properties.universida}
                              <span>Coordenador:</span>${feature.properties.coordenado}
                              <span>Decreto do Comitê Gestor:</span>${feature.properties.decreto}
                              <span>Secretaria Âncora:</span>${feature.properties.secretaria}
                              <span>Previsão de finalização</span>${feature.properties.previsao_f}
                              <span>Status</span>${feature.properties.status}
                            `;
        layer.bindPopup(popupContent);
    }
});

const pacArr = [
    {
        id: 1,
        description: 'Urbanização',
        lyr: pacUrbGroup,
        iconClass: 'fa fa-building',
        markerColor: "red",
        active: false
    },
    {
        id: 2,
        description: 'Contenção de Encostas',
        lyr: pacEncGroup,
        iconClass: 'fa fa-mountain-city',
        markerColor: "red",
        active: false
    },
];

const selecaoNovoPacArr = [
    {
        id: 1,
        description: 'Periferia Viva - Urbanização de Favelas',
        lyr: pacUrb58Group,
        iconClass: 'fa fa-city',
        markerColor: "orange",
        active: true
    },
    {
        id: 2,
        description: 'Periferia Viva - Contenção de Encostas',
        lyr: pacEncostasGroup,
        iconClass: 'fa fa-city',
        markerColor: "red",
        active: true
    },
    {
        id: 3,
        description: 'Periferia Viva - Regularização Fundiária',
        lyr: pacRegularizacaoGroup,
        iconClass: 'fa fa-file-circle-check',
        markerColor: "blue",
        active: true
    },
];

const pmrrArr = [
    {
        id: 1,
        description: 'PMRR - Municípios',
        lyr: pmrrMun,
        iconClass: 'fa fa-eye',
        markerColor: "",
        active: false
    },
]

const caravanas2023Layer = new L.GeoJSON.AJAX(caravanasUrl, {
    filter: function (feature, layer) {
        if (feature.properties.ano === 2023) {
            return true
        }
    },
    pointToLayer: function (feature, latlng) {
        let category = feature.properties.ano;

        let popupContent = `<span>Território Periférico:</span>${feature.properties.territorio}
                              <span>Caravana:</span>${feature.properties.caravana}
                              <span>Tema:</span>${feature.properties.tema}
                              <span>Visitada em:</span>${feature.properties.data}
                            `;

        let {iconClass, markerColor} = pacMappings[category] || {iconClass: "fa-van-shuttle", markerColor: "red"};
        return createPacMarker(latlng, iconClass, markerColor, popupContent);
    }
});

caravanas2023Layer.on('data:loaded', function () {
    caravana2023Group.addLayer(caravanas2023Layer);
});

const caravanas2024Layer = new L.GeoJSON.AJAX(caravanasUrl, {
    filter: function (feature, layer) {
        if (feature.properties.ano === 2024) {
            return true
        }
    },
    pointToLayer: function (feature, latlng) {
        let category = feature.properties.ano;

        let popupContent = `<span>Território Periférico:</span>${feature.properties.territorio}
                              <span>Caravana:</span>${feature.properties.caravana}
                              <span>Tema:</span>${feature.properties.tema}
                              <span>Visitada em:</span>${feature.properties.data}
                            `;

        let {iconClass, markerColor} = pacMappings[category] || {iconClass: "fa-van-shuttle", markerColor: "blue"};
        return createPacMarker(latlng, iconClass, markerColor, popupContent);
    }
});

caravanas2024Layer.on('data:loaded', function () {
    caravana2024Group.addLayer(caravanas2024Layer);
});

const caravanasArr = [
    {
        id: 1,
        description: 'Caravana das Periferias - 2023',
        lyr: caravana2023Group,
        iconClass: 'fa fa-van-shuttle',
        markerColor: "purple",
        active: false
    },
    {
        id: 2,
        description: 'Caravana das Periferias - 2024',
        lyr: caravana2024Group,
        iconClass: 'fa fa-van-shuttle',
        markerColor: "red",
        active: false
    },
];

const vulnerabilityArr = [
    {
        id: 1,
        description: 'Favelas e Comunidades Urbanas (Perímetro)',
        lyr: agsnContorno,
        iconClass: 'fa fa-eye',
        markerColor: "",
        active: false
    },
    {
        id: 2,
        description: 'Favelas e Comunidades Urbanas (Total de Domicílios)',
        lyr: agsn,
        iconClass: 'fa fa-eye',
        markerColor: "",
        active: false
    },
    {
        id: 3,
        description: 'Tipologia IntraUrbana',
        lyr: intraUrbana,
        iconClass: 'fa fa-eye',
        markerColor: "",
        active: false
    }
];

// ------------------ REDuS -------------------------------

const redusMappings = {
    "Acesso à Justiça e Combate às Desigualdades": {
        iconClass: "fa-scale-balanced",
        markerColor: "cadetblue",
        redusGroup: regusG0,
    },
    "Planejamento Urbano, Gestão de Riscos e Responsabilidade Climática": {
        iconClass: "fa-cloud-sun-rain",
        markerColor: "blue",
        redusGroup: regusG1,
    },
    "Comunicação, Inclusão Digital e Educação Popular": {
        iconClass: "fa-graduation-cap",
        markerColor: "orange",
        redusGroup: regusG2,
    },
    "Cultura e Memória": {
        iconClass: "fa-masks-theater",
        markerColor: "pink",
        redusGroup: regusG3,
    },
    "Saúde Integral e Dignidade Humana": {
        iconClass: "fa-briefcase-medical",
        markerColor: "red",
        redusGroup: regusG4,
    },
    "Soberania Alimentar e Nutricional": {
        iconClass: "fa-utensils",
        markerColor: "black",
        redusGroup: regusG5,
    },
    "Economia Solidária": {
        iconClass: "fa-sack-dollar",
        markerColor: "darkgreen",
        redusGroup: regusG6,
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

    catLayer.on('data:loaded', function () {
        properties.redusGroup.addLayer(catLayer);
    });

    redusClustersAndProperties.push({category, redusGroup: properties.redusGroup, properties});
});

const redusArr = [
    {
        id: 0,
        description: redusClustersAndProperties[0].category,
        lyr: redusClustersAndProperties[0].redusGroup,
        iconClass: redusClustersAndProperties[0].properties.iconClass,
        markerColor: redusClustersAndProperties[0].properties.markerColor,
        active: false
    },
    {
        id: 1,
        description: redusClustersAndProperties[1].category,
        lyr: redusClustersAndProperties[1].redusGroup,
        iconClass: redusClustersAndProperties[1].properties.iconClass,
        markerColor: redusClustersAndProperties[1].properties.markerColor,
        active: false
    },
    {
        id: 2,
        description: redusClustersAndProperties[2].category,
        lyr: redusClustersAndProperties[2].redusGroup,
        iconClass: redusClustersAndProperties[2].properties.iconClass,
        markerColor: redusClustersAndProperties[2].properties.markerColor,
        active: false
    },
    {
        id: 3,
        description: redusClustersAndProperties[3].category,
        lyr: redusClustersAndProperties[3].redusGroup,
        iconClass: redusClustersAndProperties[3].properties.iconClass,
        markerColor: redusClustersAndProperties[3].properties.markerColor,
        active: false
    },
    {
        id: 4,
        description: redusClustersAndProperties[4].category,
        lyr: redusClustersAndProperties[4].redusGroup,
        iconClass: redusClustersAndProperties[4].properties.iconClass,
        markerColor: redusClustersAndProperties[4].properties.markerColor,
        active: false
    },
    {
        id: 5,
        description: redusClustersAndProperties[5].category,
        lyr: redusClustersAndProperties[5].redusGroup,
        iconClass: redusClustersAndProperties[5].properties.iconClass,
        markerColor: redusClustersAndProperties[5].properties.markerColor,
        active: false
    },
    {
        id: 6,
        description: redusClustersAndProperties[6].category,
        lyr: redusClustersAndProperties[6].redusGroup,
        iconClass: redusClustersAndProperties[6].properties.iconClass,
        markerColor: redusClustersAndProperties[6].properties.markerColor,
        active: false
    },
];

const infoDoacaoPixLayer = new L.GeoJSON.AJAX(infoDoacaoUrl, {
    filter: function (feature, layer) {
        if (feature.properties.layer === 'pix') {
            return true
        }
    },
    pointToLayer: function (feature, latlng) {
        let category = feature.properties.modalidade;
        let popupContent = `<span>Nome da Organização/Iniciativa/Local:</span>${feature.properties.organizaca}
                              <span>Link para Doação:</span>
                              <a target="_blank" href="${feature.properties.link_doaca}">Clique Aqui</a>
                              <span>Endereço:</span>${feature.properties.endereco}
                              <span>Telefone</span>${feature.properties.telefone ? feature.properties.telefone : '-'}
                            `
        let {iconClass, markerColor} = pacMappings[category] || {iconClass: pinPontoColeta, markerColor: "red"};
        return createMarker(latlng, iconClass, markerColor, popupContent);
    }
});
infoDoacaoPixLayer.on('data:loaded', function () {
    infoDoacaoPixGroup.addLayer(infoDoacaoPixLayer);
});

const infoDoacaoLocalLayer = new L.GeoJSON.AJAX(infoDoacaoUrl, {
    filter: function (feature, layer) {
        if (feature.properties.layer === 'local') {
            return true
        }
    },
    pointToLayer: function (feature, latlng) {
        let category = feature.properties.modalidade;
        let popupContent = `<span>Nome da Organização/Iniciativa/Local:</span>${feature.properties.organizaca}
                              <span>Endereço:</span>${feature.properties.endereco}
                              <span>Telefone</span>${feature.properties.telefone ? feature.properties.telefone : '-'}
                            `
        let {iconClass, markerColor} = pacMappings[category] || {iconClass: pinPontoColeta, markerColor: "red"};
        return createMarker(latlng, iconClass, markerColor, popupContent);
    }
});
infoDoacaoLocalLayer.on('data:loaded', function () {
    infoDoacaoLocalGroup.addLayer(infoDoacaoLocalLayer);
});

const infoDoacaoArr = [
    {
        id: 1,
        description: 'Doação via PIX',
        lyr: infoDoacaoPixGroup,
        iconClass: 'fa-question',
        markerColor: "red",
        active: false
    },
    {
        id: 2,
        description: 'Doação no Local',
        lyr: infoDoacaoLocalGroup,
        iconClass: 'fa-question',
        markerColor: "red",
        active: false
    },
];


const exemploLayer = new L.GeoJSON.AJAX(exemploUrl, {
    pointToLayer: function (feature, latlng) {
        let category = feature.properties.modalidade;

        let popupContent = `<span>Nome:</span>${feature.properties.nome}`
        let {iconClass, markerColor} = pacMappings[category] || {iconClass: "fa-house", markerColor: "cadetblue"};
        return createPacMarker(latlng, iconClass, markerColor, popupContent);
    }
});
exemploLayer.on('data:loaded', function () {
    exemploGroup.addLayer(exemploLayer);
});

const exemploArr = [
    {
        id: 1,
        description: 'Camada de Exemplo',
        lyr: exemploGroup,
        iconClass: 'fa-house',
        markerColor: "cadetblue",
        active: false
    }
];