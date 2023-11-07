from django.db import models


class BaseModel(models.Model):
    ativo = models.BooleanField('Ativo', default=True, blank=True)
    criado = models.DateTimeField('Criado', auto_now_add=True)
    modificado = models.DateTimeField('Modificado', auto_now=True)

    class Meta:
        abstract = True
