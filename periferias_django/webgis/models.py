from django.contrib.gis.db import models
from django.contrib.gis.geos import Point


class Estado(models.Model):
    nome = models.CharField('nome', max_length=20)
    sigla_uf = models.CharField('abreviação', max_length=2)
    area_km2 = models.DecimalField(
        'área (km2)', max_digits=10, decimal_places=2)

    def __str__(self):
        return self.nome

    @property
    def extent(self):
        minlng, minlat, maxlng, maxlat = self.estadogeometria.geom.extent
        return [[minlat, minlng], [maxlat, maxlng]]

    class Meta:
        ordering = ['nome']
        verbose_name = 'Estado'
        verbose_name_plural = 'Estados'


class EstadoGeometria(models.Model):
    estado = models.OneToOneField('Estado', verbose_name='estado', on_delete=models.PROTECT)
    cod_ibge_m = models.CharField('código IBGE', max_length=20)
    geom = models.MultiPolygonField('geom', srid=4326)

    @property
    def extent(self):
        minlng, minlat, maxlng, maxlat = self.geom.extent
        return [[minlat, minlng], [maxlat, maxlng]]

    class Meta:
        ordering = ['cod_ibge_m']
        verbose_name = 'Geometria do Estado'
        verbose_name_plural = 'Geometrias dos Estados'


class Municipio(models.Model):
    nome = models.CharField('nome', max_length=40)
    estado = models.ForeignKey('Estado', verbose_name='estado', on_delete=models.PROTECT)
    sigla_uf = models.CharField('UF', max_length=2, blank=True, null=True)
    cod_ibge_m = models.CharField('código IBGE', max_length=20)
    sede_lng = models.FloatField('Longitude da Sede', blank=True, null=True)
    sede_lat = models.FloatField('Latitude da Sede', blank=True, null=True)
    slug = models.SlugField()

    def __str__(self):
        return '{}/{}'.format(self.nome, self.estado.sigla_uf, )

    @property
    def sede(self):
        return Point(self.sede_lng, self.sede_lat, srid=4326)

    @property
    def centro(self):
        return [
            self.municipiogeometria.geom.point_on_surface.y,
            self.municipiogeometria.geom.point_on_surface.x
        ]

    @property
    def extent(self):
        minlng, minlat, maxlng, maxlat = self.municipiogeometria.geom.extent
        return [[minlat, minlng], [maxlat, maxlng]]

    class Meta:
        verbose_name = 'Município'
        verbose_name_plural = 'Municípios'
        ordering = ('sigla_uf', 'nome')


class MunicipioGeometria(models.Model):
    municipio = models.OneToOneField('Municipio', verbose_name='municipio', on_delete=models.PROTECT)
    cod_ibge_m = models.CharField('código IBGE', max_length=20)
    area_km2 = models.DecimalField('Área (km2)', max_digits=10, decimal_places=2, blank=True, null=True)
    geom = models.MultiPolygonField('Geom', srid=4326)

    def __str__(self):
        return self.municipio.nome

    @property
    def extent(self):
        minlng, minlat, maxlng, maxlat = self.geom.extent
        return [[minlat, minlng], [maxlat, maxlng]]

    @property
    def vizinhos(self):
        qs = MunicipioGeometria.objects.filter(
            geom__intersects=self.geom).exclude(municipio=self.municipio)
        return [municipio.cod_ibge_m for municipio in qs if municipio.cod_ibge_m != self.cod_ibge_m]

    class Meta:
        verbose_name = 'Geometria do Município'
        verbose_name_plural = 'Geometrias dos Municípios'
        ordering = ('cod_ibge_m',)
