const {createApp} = Vue

createApp({
    components: {
        vSelect: window["vue-select"]
    },
    data() {
        return {
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
            geocodingSearch.addTo(this.map)
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
        getMunicipios(id) {
            let domain = this.$refs.geoserver_url.value;
            let basePath = 'mapa_periferias/ows';
            let params = new URLSearchParams({
                service: 'WFS',
                version: '1.0.0',
                request: 'GetFeature',
                typeName: `mapa_periferias:${id}`,
                outputFormat: 'application/json'
            });
            let url = `${domain}${basePath}?${params.toString()}`;

            axios.get(url)
                .then((response) => {
                    this.municipiosArr = response.data.features
                        .filter(feature => feature.properties.municipio && feature.properties.uf)
                        .map(feature => {
                            return {
                                id: `${feature.properties.municipio}/${feature.properties.uf}`,
                                key: `${feature.properties.municipio}/${feature.properties.uf}`
                            };
                        });
                })
                .catch(error => {
                    console.error('Erro ao buscar municípios:', error);
                });
        },

        getItems(id, place) {
            let domain = this.$refs.geoserver_url.value;
            let layer = id.replace('municipios_', '')
            let city = place.split('/')[0];
            let state = place.split('/')[1];
            let basePath = 'mapa_periferias/ows';
            let params = new URLSearchParams({
                    service: 'WFS',
                    version: '1.0.0',
                    request: 'GetFeature',
                    typeName: `mapa_periferias:${layer}`,
                    cql_filter: `municipio = '${city}' AND uf = '${state}'`,
                    outputFormat: 'application/json'
                })
            ;
            let url = `${domain}${basePath}?${params.toString()}`;

            axios.get(url)
                .then((response) => {
                    this.elemArr = response.data.features
                        .filter(feature => feature.properties.organizacao)
                        .map(feature => {
                            return {
                                id: `${feature.properties.id}`,
                                key: `${feature.properties.organizacao}`,
                                layer: layer,
                                coords: feature.geometry.coordinates
                            };
                        });
                })
                .catch(error => {
                    console.error('Erro ao buscar municípios:', error);
                });
        },
        clearSearch() {
            this.municipiosArr = [];
            this.map.setView([-13.9234038, -55.1953125], 4);
            this.map.removeLayer(this.circleMarker);
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

                    this.getMunicipios(newValue.id);

                } else {
                    this.municipiosArr = []
                    this.map.setView([-13.9234038, -55.1953125], 4)
                }
            }, deep: true
        },
        selectedMun: {
            handler(newValue, oldValue) {
                if (newValue) {
                    this.getItems(this.selectedLayer.id, newValue.id)
                } else {
                    this.elemArr = [];
                }
            }, deep: true
        },
        selectedElem: {
            handler(newValue, oldValue) {
                if (newValue) {
                    let x = newValue.coords[0];
                    let y = newValue.coords[1];
                    let circleMarkerOptions = {
                        radius: 25, // in meters
                        color: 'red',
                        fillColor: '#ff0101',
                        fillOpacity: 0.2,
                        opacity: 0.4
                    };
                    this.circleMarker = L.circleMarker([y, x], circleMarkerOptions).addTo(this.map)
                    this.map.setView([y, x], 18);
                } else {
                    this.map.removeLayer(this.circleMarker);
                }
            }, deep: true
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
        showBtn() {
            return !!(this.selectedElem && this.selectedElem.id);
        }
    }
}).mount('#app')
