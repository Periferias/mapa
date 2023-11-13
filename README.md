# Mapa das Periferias

## Requisitos

* Python 3.10.13
* PostgreSQL >= 12
* PostGIS >= 12
* Bibliotecas espaciais: PROJ, GDAL e GEOS

## Configurações do Banco de Dados Espacial

É necessário criar um banco **PostgreSQL** e habilitar a extensão espacial **PostGIS**, no terminal, faça:

```
createdb periferias_db
psql periferias_db
CREATE EXTENSION postgis;
\d
```

## Como rodar a versão estática?

* entre na pasta `/periferias_django/versao_estatica` e execute no terminal `npx serve`.


## Como desenvolver?

* Clone o repositório;
* Crie um virtualenv com Python 3.10.13;
* Ative o virtualenv;
* Instale as dependências do ambiente de desenvolvimento;
* Crie o banco de dados espacial como foi descrito acima.
```
git clone git@github.com:Periferias/mapa.git
cd mapa
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
```

* Renomeie o arquivo `env-sample` para `.env`:

```
mv env-sample .env
```

* Preencha as informações do `.env` e rode os seguintes comandos:

```
python manage.py check
python manage.py makemigrations
python manage.py migrate
```

## Como carregar os dados espaciais?

Se você criou o Bando de Dados Espacial e rodou as migrações, é hora de fazer isso. Os dados estão fora do repositório por conta do seu tamanho:

* Faça o download dos dados neste link: https://drive.google.com/file/d/1A9d7y6UEl8K17FlZEw32C4DgWHfytPHC/view?usp=drive_link;
* Descompacte o arquivo;
* Dê a carga no banco.


```
tar -zxvf tabelas.tar.gz

psql -v ON_ERROR_STOP=1 -f webgis_estado.sql -d periferias_db
psql -v ON_ERROR_STOP=1 -f webgis_estadogeometria.sql -d periferias_db
psql -v ON_ERROR_STOP=1 -f webgis_municipio.sql -d periferias_db
psql -v ON_ERROR_STOP=1 -f webgis_municipiogeometria.sql -d periferias_db
psql -v ON_ERROR_STOP=1 -f acao_acao.sql -d periferias_db

```
