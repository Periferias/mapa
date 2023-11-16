const {createApp} = Vue

createApp({
    data() {
        return {
            map: undefined,
            legend: undefined,
            info: undefined,
            statesBr: undefined,
            contourBr: undefined,
            bounds: L.latLngBounds(
                L.latLng(-33.7511779940000025, -73.9831821599999984),
                L.latLng(5.2695808330000000, -28.8477703530000014)
            ),
            googleStreets: undefined,
            googleSatellite: undefined,
            acoesLayer: undefined,
            acoesCluster: undefined,

            nomeAcao: '',

        }
    },
    methods: {
        baseLayers() {
            let googleOpts = {
                maxZoom: 21,
                subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
            };
            this.googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', googleOpts);
            this.googleSatellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', googleOpts);
        },
        initMap() {
            this.map = L.map('map', {
                    zoom: 4,
                    minZoom: 5,
                    zoomControl: false,
                    maxBounds: this.bounds,
                    layers: [this.googleStreets]
                }
            ).fitBounds(this.bounds)
            this.map.setMinZoom(this.map.getBoundsZoom(this.map.options.maxBounds));
            fullScreen.addTo(this.map);
            zoomHome.addTo(this.map);
            coordinates.addTo(this.map);

            this.acoesLayer = new L.GeoJSON.AJAX(acoesUrl, {
                pointToLayer: pointToLayer,
            });

            this.acoesCluster = new L.markerClusterGroup();

            this.acoesLayer.on('data:loaded', () => {
                this.acoesCluster.addLayer(this.acoesLayer)
            });

            this.acoesCluster.addTo(this.map);


        },
        searchByProperty(propertyName, propertyValue) {
            var foundFeatures = [];
            this.acoesLayer.eachLayer(function (layer) {
                if (layer.feature.properties && layer.feature.properties[propertyName] === propertyValue) {
                    foundFeatures.push(layer.feature);
                }
            });
            return foundFeatures;
        },
        initGroups() {
            const baseMaps = {
                "Google Streets": this.googleStreets,
                "Google Satellite": this.googleSatellite,
            };
            const overlayMaps = {
                'Ações': this.acoesCluster,
            }
            L.control.layers(baseMaps, overlayMaps).addTo(this.map);
        },
        capturarAcao() {
            console.log('Texto digitado:', this.nomeAcao);
            this.map.removeLayer(this.acoesCluster);

            let searchResult = this.searchByProperty('nome_acao', this.nomeAcao)

            if (searchResult.length > 0) {

                console.log(searchResult)


                console.log("Feature encontrada: ", searchResult[0]);
            } else {
                console.log("Nenhuma feature encontrada...");
            }
        }

    },
    mounted() {
        this.baseLayers();
        this.initMap();
        this.initGroups();
    }
}).mount('#app')
