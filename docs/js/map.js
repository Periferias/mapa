const {createApp} = Vue

createApp({
    components: {
        vSelect: window["vue-select"]
    },
    data() {
        return {
            searchTerm: '',
            loading: false,
            searchMessage: '',
            btnClear: false,
            municipiosItems: [],
            periferiaItems: [],
            redusItems: [],
            municipioSelecionado: undefined,
            map: undefined,
            switchBtn: false,
            bounds: L.latLngBounds(
                L.latLng(5.397273407690917, -32.21191406250001),
                L.latLng(-33.247875947924385, -78.00292968750001)
            ),
            baseLayers: baseLayers,
            periferiaLayers: periferiaLayers,
            caravanaLayers: caravanasArr,
            vulnerabilityLayers: vulnerabilityArr,
            redusLayers: redusArr,
            pacLayers: pacArr,
            selecaoNovoPacArr: selecaoNovoPacArr,
            pmrrLayers: pmrrArr,
            activeActions: true,
            activeredusActions: false,
            activePacActions: false,
            activeCaravanaActions: true,
            activeVulActions: true,
            activePnrrActions: false,
            activeColetaActions: true,
            activeSelecaoNovoPacActions: true,
            circleMarker: L.circleMarker(),
            parentGroup: parentGroup,
            infoDoacaoLayers: infoDoacaoArr,
            residenciaLayers: residenciasArr,
            activeResidenciaActions: false,
        }
    },
    methods: {
        initMap() {
            this.map = L.map('map', {
                    center: [-13.9234038, -55.1953125],
                    zoom: 4,
                    maxZoom: 21,
                    //scrollWheelZoom: false,
                    gestureHandling: true,
                    zoomControl: false,
                    maxBounds: this.bounds.pad(1),
                    zoomAnimation: false,
                    fadeAnimation: true,
                    markerZoomAnimation: true,
                    dragging: !L.Browser.mobile,
                    layers: [
                        limitsBr,
                        this.parentGroup,
                        this.baseLayers[0].lyr,
                        // this.periferiaLayers[0].lyr,
                        // this.periferiaLayers[1].lyr,
                        // this.periferiaLayers[2].lyr,
                        // this.periferiaLayers[3].lyr,
                        // this.periferiaLayers[4].lyr,
                        // this.periferiaLayers[5].lyr,
                        // this.periferiaLayers[6].lyr,
                        // this.caravanaLayers[0].lyr,
                        // this.infoDoacaoLayers[0].lyr,
                        // this.infoDoacaoLayers[1].lyr,
                        this.selecaoNovoPacArr[0].lyr,
                        this.selecaoNovoPacArr[1].lyr,
                        this.selecaoNovoPacArr[2].lyr,
                        americaSul,
                        //agsnContorno,
                    ]
                }
            );
            this.map.on('moveend', e => {
                if (this.map.getZoom() > 10) {
                    this.map.removeLayer(limitsBr);
                } else {
                    this.map.addLayer(limitsBr);
                }
                this.bounds = this.map.getBounds();
            });
            coordinates.addTo(this.map);
            zoomHome.addTo(this.map);
            L.control.sidebar('sidebar').addTo(this.map)
        },
        activeBaseLayer(id) {
            this.baseLayers.find(layer => {
                if (layer.id === id) {
                    layer.active = true;
                    this.map.addLayer(layer.lyr);
                } else {
                    layer.active = false;
                    this.map.removeLayer(layer.lyr);
                }
            })
        },
        activeOverlayLayer(arr, id) {
            const layer = arr.find(layer => layer.id === id);
            if (layer) {
                layer.active = !layer.active;
                if (layer.active) {
                    this.map.addLayer(layer.lyr);
                } else {
                    this.map.removeLayer(layer.lyr);
                }
            }
        },
        checkOverlayLayers(activeActionsName, arr) {
            // Inverte a propriedade 'activeActionsName'
            this[activeActionsName] = !this[activeActionsName];

            // Itera sobre cada camada no array 'arr'
            arr.forEach(layer => {
                // Define o estado 'active' da camada com base em 'activeActionsName'
                layer.active = this[activeActionsName];

                // Adiciona ou remove a camada do mapa com base no estado 'active'
                if (layer.active) {
                    this.map.addLayer(layer.lyr);
                } else {
                    this.map.removeLayer(layer.lyr);
                }
            });
        },
        searchItems() {
            if (this.searchTerm.length >= 4) {
                let slug = string_to_slug(this.searchTerm)
                this.loading = true;
                this.searchMessage = '';
                let domain = GEOSERVER_URL;
                let basePath = 'mapa_periferias/ows';
                let params_municipios = new URLSearchParams({
                    service: 'WFS',
                    version: '1.0.0',
                    request: 'GetFeature',
                    typeName: `mapa_periferias:municipio_bbox`,
                    cql_filter: `slug ilike '%${slug}%'`,
                    outputFormat: 'application/json'
                });
                let url_municipios = `${domain}${basePath}?${params_municipios.toString()}`;
                axios.get(url_municipios)
                    .then((response) => {
                        this.municipiosItems = response.data.features
                            .filter(feature => feature.properties.nome)
                            .map(feature => {
                                return {
                                    id: feature.properties.id,
                                    nome: feature.properties.nome,
                                    uf: feature.properties.uf,
                                    bbox: JSON.parse(JSON.parse(feature.properties.bbox)),
                                    codIbge: feature.properties.cod_ibge_m
                                };
                            });
                    })
                    .finally((response) => {
                        this.loading = false;
                    })

                    .catch(error => {
                        console.error('Erro ao buscar municípios:', error);
                        this.loading = true;
                    });

                let params_periferia = new URLSearchParams({
                    service: 'WFS',
                    version: '1.0.0',
                    request: 'GetFeature',
                    typeName: `mapa_periferias:iniciativa_periferia_viva`,
                    cql_filter: `organizacao_slug ilike '%${slug}%'`,
                    outputFormat: 'application/json'
                });

                let url_periferia_viva = `${domain}${basePath}?${params_periferia.toString()}`;
                axios.get(url_periferia_viva)
                    .then((response) => {
                        this.periferiaItems = response.data.features
                            .map(feature => {
                                return {
                                    id: feature.properties.id,
                                    organizacao: feature.properties.organizacao,
                                    municipio_cadastro: feature.properties.municipio_cadastro,
                                    uf: feature.properties.uf,
                                    coords: feature.geometry.coordinates
                                };
                            });
                    })
                    .catch(error => {
                        console.error('Erro ao buscar periferia viva:', error);
                    });

                let params_redus = new URLSearchParams({
                    service: 'WFS',
                    version: '1.0.0',
                    request: 'GetFeature',
                    typeName: `mapa_periferias:iniciativa_redus`,
                    cql_filter: `organizacao_slug ilike '%${slug}%'`,
                    outputFormat: 'application/json'
                });

                let url_redus = `${domain}${basePath}?${params_redus.toString()}`;
                axios.get(url_redus)
                    .then((response) => {
                        this.redusItems = response.data.features
                            .map(feature => {
                                return {
                                    id: feature.properties.id,
                                    organizacao: feature.properties.organizacao,
                                    municipio_cadastro: feature.properties.municipio_cadastro,
                                    uf: feature.properties.uf,
                                    coords: feature.geometry.coordinates
                                };
                            });

                    })
                    .catch(error => {
                        console.error('Erro ao buscar redus:', error);
                    });
            } else {
                this.searchMessage = 'Digite o nome de um Município ou de uma Iniciativa'
            }
            this.btnClear = true;
        },
        formatIniciativa(text) {
            return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        },
        zoomToMunicipio(bbox, codIbge) {
            if (this.municipioSelecionado) {
                this.map.removeLayer(this.municipioSelecionado);
            }
            this.map.fitBounds(bbox);
            this.municipioSelecionado = L.tileLayer.wms(geoServerWmsUrl, {
                format: 'image/png',
                transparent: true,
                version: '1.1.0',
                maxZoom: 20,
                opacity: 1,
                zIndex: 1,
                layers: 'mapa_periferias:municipio',
                cql_filter: `cod_ibge_m=${codIbge}`
            });
            this.map.addLayer(this.municipioSelecionado);
            this.map.fitBounds(bbox);
        },
        zoomToMarker(coords, layer) {
            if (layer === 'redus') {
                this.redusLayers.forEach(layer => {
                    layer.active = true
                    this.map.addLayer(layer.lyr)
                })
            }

            if (this.circleMarker) {
                this.map.removeLayer(this.circleMarker)
            }

            let x = coords[0];
            let y = coords[1];
            let circleMarkerOptions = {
                radius: 25, // in meters
                color: 'red',
                fillColor: '#ff0101',
                fillOpacity: 0.2,
                opacity: 0.4
            };
            this.circleMarker = L.circleMarker([y, x], circleMarkerOptions
            ).addTo(this.map)
            this.map.setView([y, x], 18);
        },
        clearSearch() {
            this.searchTerm = '';
            this.searchMessage = ''
            this.btnClear = false
            this.municipiosItems = [];
            this.periferiaItems = [];
            this.redusItems = [];
            this.map.removeLayer(this.circleMarker);
            this.map.removeLayer(this.municipioSelecionado);
            this.map.setView([-13.9234038, -55.1953125], 4);
        },
        hasActiveArrItem(arr) {
            return !!arr.some(item => item.active);
        },
        hasActiveItem(layer) {
            return !!layer.active;
        }
    },
    mounted() {
        this.initMap();
    },
    watch: {
        switchBtn: {
            handler(newValue, oldValue) {
                if (newValue) {
                    this.periferiaLayers.forEach(layer => {
                        let activeState = layer.active
                        premiadoLayers[layer.id].active = activeState
                        this.map.removeLayer(layer.lyr)
                    })
                    this.periferiaLayers = premiadoLayers;
                    this.periferiaLayers.forEach(layer => {
                        if (layer.active) {
                            this.map.addLayer(layer.lyr)
                        } else {
                            this.map.removeLayer(layer.lyr)
                        }
                    });

                } else {
                    this.periferiaLayers.forEach(layer => {
                        let activeState = layer.active
                        periferiaLayers[layer.id].active = activeState
                        this.map.removeLayer(layer.lyr)
                    })
                    this.periferiaLayers = periferiaLayers;

                    this.periferiaLayers.forEach(layer => {
                        if (layer.active) {
                            this.map.addLayer(layer.lyr)
                        } else {
                            this.map.removeLayer(layer.lyr)
                        }
                    });
                }
            }
        }
    },
    computed: {
        hasMunicipio() {
            return this.municipiosItems.length > 0
        },
        hasPeriferia() {
            return this.periferiaItems.length;
        },
        hasRedus() {
            return this.redusItems.length;
        },
        hasSearchTerm() {
            return this.searchTerm.length;
        },
        hasActivePacLayers() {
            return this.pacLayers.some(layer => layer.active);
        },
        activePacLayers() {
            return this.pacLayers.filter(layer => layer.active);
        },
    }
}).mount('#app')
