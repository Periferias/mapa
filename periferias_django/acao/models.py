from django.contrib.gis.db import models

from periferias_django.core.models import BaseModel


class Acao(BaseModel):
    nome_acao = models.CharField('Nome da Ação', max_length=255, blank=True, null=True)
    nome_comunidade = models.CharField('Nome da Comunidade', max_length=255, blank=True, null=True)
    localidade = models.CharField('Localidade', max_length=255, blank=True, null=True)
    organizacao = models.CharField('Organização', max_length=255, blank=True, null=True)
    categoria = models.CharField('Categoria', max_length=255, blank=True, null=True)
    estado = models.CharField('Estado', max_length=50, blank=True, null=True)
    municipio = models.CharField('Município', max_length=50, blank=True, null=True)
    geom = models.PointField('Geometria', srid=4326)

    def __str__(self):
        return self.nome_comunidade

    @property
    def popup_content(self):
        popup = f'<span>Nome da Ação:</span>{self.nome_acao}'
        popup += f'<span>Comunidade:</span>{self.nome_comunidade}'
        popup += f'<span>Organização:</span>{self.organizacao}'
        popup += f'<span>Categoria:</span>{self.categoria}'
        popup += f'<span>Localidade:</span>{self.localidade}'
        popup += f'<span>Município:</span>{self.municipio}'
        popup += f'<span>Estado:</span>{self.estado}'

        return popup

    class Meta:
        verbose_name = 'ação'
        verbose_name_plural = 'Ações'
