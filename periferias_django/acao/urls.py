from django.urls import path

from . import views as v

app_name = 'acao'

urlpatterns = [
    path('acao.geojson/', v.acao_geojson, name='acao_geojson'),
]
