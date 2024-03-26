const {createApp} = Vue

createApp({
    components: {
        vSelect: window["vue-select"]
    },
    data() {
        return {
            searchTerm: '',
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
            activeActions: true,
            activeredusActions: false,

            selectedLayer: {id: 0, key: 'Escolha a camada...'},
            layerArr: [
                {id: 0, key: 'Escolha a camada...'},
                {id: 'municipios_periferia_viva', key: 'Prêmio Periferia Viva 2023'},
                {id: 'municipios_redus', key: 'Iniciativa Periféricas Cadastradas'},
            ],
            selectedMun: {id: 0, key: 'Escolha o município...'},
            municipiosArr: [],

            selectedElem: {id: 0, key: 'Escolha o item...'},
            elemArr: [],
            circleMarker: L.circleMarker()

        }
    },
    methods: {
        initMap() {
            this.map = L.map('map', {
                    center: [-13.9234038, -55.1953125],
                    zoom: 4,
                    maxZoom: 21,
                    scrollWheelZoom: false,
                    zoomControl: false,
                    maxBounds: this.bounds,
                    zoomAnimation: false,
                    fadeAnimation: true,
                    markerZoomAnimation: true,
                    dragging: !L.Browser.mobile,
                    layers: [
                        limitsBr,
                        this.baseLayers[0].lyr,
                        this.periferiaLayers[0].lyr,
                        this.periferiaLayers[1].lyr,
                        this.periferiaLayers[2].lyr,
                        this.periferiaLayers[3].lyr,
                        this.periferiaLayers[4].lyr,
                        this.periferiaLayers[5].lyr,
                        this.periferiaLayers[6].lyr,
                        this.caravanaLayers[0].lyr,
                        americaSul,
                        agsnContorno
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
            //geocodingSearch.addTo(this.map)
            //geocodingSearch.setPosition('topleft');
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
        activeOverlayLayer(id) {
            this.periferiaLayers.find(layer => {
                if (layer.id === id) {
                    layer.active = !layer.active
                    if (layer.active) {
                        this.map.addLayer(layer.lyr)
                    } else {
                        layer.active = false
                        this.map.removeLayer(layer.lyr)
                    }
                }
            })
        },
        activeRedusLayer(id) {
            this.redusLayers.find(layer => {
                if (layer.id === id) {
                    layer.active = !layer.active
                    if (layer.active) {
                        this.map.addLayer(layer.lyr)
                    } else {
                        layer.active = false
                        this.map.removeLayer(layer.lyr)
                    }
                }
            })
        },
        activeCaravanaLayer(id) {
            this.caravanaLayers.find(layer => {
                if (layer.id === id) {
                    layer.active = !layer.active
                    if (layer.active) {
                        this.map.addLayer(layer.lyr)
                    } else {
                        layer.active = false
                        this.map.removeLayer(layer.lyr)
                    }
                }
            })
        },
        activePacLayer(id) {
            this.pacLayers.find(layer => {
                if (layer.id === id) {
                    layer.active = !layer.active
                    if (layer.active) {
                        this.map.addLayer(layer.lyr)
                    } else {
                        layer.active = false
                        this.map.removeLayer(layer.lyr)
                    }
                }
            })
        },
        activeVulnerabilityLayer(id) {
            this.vulnerabilityLayers.find(layer => {
                if (layer.id === id) {
                    layer.active = !layer.active
                    if (layer.active) {
                        this.map.addLayer(layer.lyr)
                    } else {
                        layer.active = false
                        this.map.removeLayer(layer.lyr)
                    }
                }
            })
        },
        checkOverlayLayers() {
            this.activeActions = !this.activeActions;
            if (!this.activeActions) {
                this.periferiaLayers.forEach(layer => {
                    layer.active = false
                    this.map.removeLayer(layer.lyr)
                })
            } else {
                this.periferiaLayers.forEach(layer => {
                    layer.active = true
                    this.map.addLayer(layer.lyr)
                })
            }
        },
        checkRedusOverlayLayers() {
            this.activeredusActions = !this.activeredusActions;
            if (!this.activeredusActions) {
                this.redusLayers.forEach(layer => {
                    layer.active = false
                    this.map.removeLayer(layer.lyr)
                })
            } else {
                this.redusLayers.forEach(layer => {
                    layer.active = true
                    this.map.addLayer(layer.lyr)
                })
            }
        },
        searchItems() {

            if (this.searchTerm.length >= 4) {

                this.searchMessage = ''
                let domain = this.$refs.geoserver_url.value;
                let basePath = 'mapa_periferias/ows';
                let params_municipios = new URLSearchParams({
                    service: 'WFS',
                    version: '1.0.0',
                    request: 'GetFeature',
                    typeName: `mapa_periferias:municipio_bbox`,
                    cql_filter: `nome ilike '%${this.searchTerm}%'`,
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
                    .catch(error => {
                        console.error('Erro ao buscar municípios:', error);
                    });

                let params_periferia = new URLSearchParams({
                    service: 'WFS',
                    version: '1.0.0',
                    request: 'GetFeature',
                    typeName: `mapa_periferias:iniciativa_periferia_viva`,
                    cql_filter: `organizacao ilike '%${this.searchTerm}%'`,
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
                    cql_filter: `organizacao ilike '%${this.searchTerm}%'`,
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

            this.btnClear = true


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
        }
        ,
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
        }
        ,

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
        }
    },
    mounted() {
        this.initMap();
    },

    watch: {
        selectedLayer: {
            handler(newValue, oldValue) {
                if (newValue) {
                    if (newValue.id === 'municipios_periferia_viva') {
                        this.periferiaLayers.forEach(layer => {
                            layer.active = true
                            this.map.addLayer(layer.lyr)
                        })
                        this.redusLayers.forEach(layer => {
                            layer.active = false
                            this.map.removeLayer(layer.lyr)
                        })
                    } else {
                        this.redusLayers.forEach(layer => {
                            layer.active = true
                            this.map.addLayer(layer.lyr)
                        })
                        this.periferiaLayers.forEach(layer => {
                            layer.active = false
                            this.map.removeLayer(layer.lyr)
                        })
                    }
                } else {
                    this.municipiosArr = []
                    this.map.setView([-13.9234038, -55.1953125], 4)
                }
            },
            deep: true
        },
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
        hasMunicipios() {
            return this.municipiosItems.length;
        },
        hasPeriferia() {
            return this.periferiaItems.length;
        },

        hasRedus() {
            return this.redusItems.length;
        },
        hasSearchTerm() {
            return this.searchTerm.length;
        }
    }
}).mount('#app')
