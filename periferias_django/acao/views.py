from djgeojson.views import GeoJSONLayerView

from . import models


class AcaoGeoJson(GeoJSONLayerView):
    def get_queryset(self):
        return models.Acao.objects.filter(
            ativo=True
        )

    properties = ('categoria', 'popup_content',)


acao_geojson = AcaoGeoJson.as_view()
