const {createApp} = Vue

createApp({
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
    }
}).mount('#app')
