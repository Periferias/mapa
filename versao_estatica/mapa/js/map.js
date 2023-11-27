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
            overlayLayers: overlayLayers,
            caravanaLayers: caravanasArr,
        }
    },
    methods: {
        initMap() {
            this.map = L.map('map', {
                    center: [-13.9234038, -55.1953125],
                    zoom: 4,
                    minZoom: 5,
                    maxZoom: 21,
                    zoomControl: false,
                    maxBounds: this.bounds,
                    zoomAnimation: false,
                    fadeAnimation: true,
                    markerZoomAnimation: true,
                    layers: [
                        limitsBr,
                        this.baseLayers[0].lyr,
                        this.overlayLayers[0].lyr,
                        this.overlayLayers[1].lyr,
                        this.overlayLayers[2].lyr,
                        this.overlayLayers[3].lyr,
                        this.overlayLayers[4].lyr,
                        this.overlayLayers[5].lyr,
                        this.overlayLayers[6].lyr,
                        this.caravanaLayers[0].lyr
                    ]
                }
            );
            this.map.setMinZoom(this.map.getBoundsZoom(this.map.options.maxBounds));

            this.map.on('moveend', e => {
                this.bounds = this.map.getBounds()
            });

            coordinates.addTo(this.map);
            geocodingSearch.addTo(this.map)
            //geocodingSearch.setPosition('topleft');
            zoomHome.addTo(this.map);
            fullScreen.addTo(this.map);
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
            this.overlayLayers.find(layer => {
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
    },
    mounted() {
        this.initMap();

    },
    watch: {
        switchBtn: {
            handler(newValue, oldValue) {
                if (newValue) {
                    this.overlayLayers.forEach(layer => {
                        let activeState = layer.active
                        premiumOverlayLayers[layer.id].active = activeState

                        this.map.removeLayer(layer.lyr)
                    })

                    this.overlayLayers = premiumOverlayLayers;

                    this.overlayLayers.forEach(layer => {
                        if (layer.active) {
                            this.map.addLayer(layer.lyr)
                        } else {
                            this.map.removeLayer(layer.lyr)
                        }
                    });

                } else {
                    this.overlayLayers.forEach(layer => {
                        let activeState = layer.active
                        overlayLayers[layer.id].active = activeState
                        this.map.removeLayer(layer.lyr)
                    })
                    this.overlayLayers = overlayLayers;

                    this.overlayLayers.forEach(layer => {
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
