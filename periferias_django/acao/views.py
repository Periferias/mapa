from djgeojson.views import GeoJSONLayerView

from . import models


class AcaoGeoJson(GeoJSONLayerView):
    def get_queryset(self):
        return models.Acao.objects.filter(
            ativo=True
        )

    properties = (
        'id',
        'nome_acao',
        'nome_comunidade',
        'premiado',
        'localidade',
        'organizacao',
        'categoria',
        'municipio',
        'estado',
    )


acao_geojson = AcaoGeoJson.as_view()
