const zoomHome = L.Control.zoomHome({
    zoomHomeTitle: 'Zoom Inicial',
});

const fullScreen = L.control.fullscreen({
    position: 'topleft',
    title: 'Mapa em tela cheia',
    titleCancel: 'Sair da tela cheia',
    fullscreenControl: true,
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

const acoesUrl = $('#acoes_geojson').val();

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

    const {iconClass, markerColor} = categoryMappings[category] || {
        iconClass: "fa-question",
        markerColor: "gray"
    };
    return createMarker(latlng, iconClass, markerColor, popupContent);
}