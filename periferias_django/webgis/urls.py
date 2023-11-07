from django.urls import path

from . import views as v

app_name = 'webgis'

urlpatterns = [
    path('', v.webgis, name='webgis'),

]
