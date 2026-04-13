# backend-declic
Backend d'un projet d'application mobile.

## Stack
- Python 3.10+
- Django 4.2 LTS
- Django REST Framework
- FastAPI
- MySQL
- drf-spectacular (documentation OpenAPI)
- django-cors-headers

## Structure
Le projet est organise pour grandir proprement:

- `config/settings/base.py`: configuration commune
- `config/settings/development.py`: config locale
- `config/settings/production.py`: config production
- `apps/`: toutes les applications metier
- `apps/api/v1/`: points d'entree API versionnes

## Installation
1. Creer l'environnement virtuel Python:

	```bash
	python3 -m venv .venv
	```

2. Activer l'environnement virtuel:

	Linux / macOS:

	```bash
	source .venv/bin/activate
	```

	Windows (PowerShell):

	```powershell
	.venv\Scripts\Activate.ps1
	```

	Windows (cmd):

	```bat
	.venv\Scripts\activate.bat
	```

3. Installer les dependances:

	```bash
	pip install -r requirements.txt
	```

4. Copier le fichier d'environnement:

	```bash
	cp .env.example .env
	```

5. Appliquer les migrations:

	```bash
	python manage.py migrate
	```

6. Lancer le serveur:

	```bash
	python manage.py runserver
	```

## Configuration MySQL
Les informations de connexion a la base se modifient dans le fichier `.env`.

Note de compatibilite: le projet est volontairement cale sur Django 4.2 LTS pour rester compatible avec MariaDB 10.4.x. Si tu mets a jour MariaDB en 10.5+, tu pourras ensuite remonter vers Django 5.x.

1. Copier le modele:

	```bash
	cp .env.example .env
	```

2. Modifier ces variables dans `.env`:

	```env
	DB_ENGINE=django.db.backends.mysql
	DB_NAME=backen_sapen
	DB_USER=root
	DB_PASSWORD=change-me
	DB_HOST=127.0.0.1
	DB_PORT=3306
	```

3. Creer la base MySQL si elle n'existe pas:

	```sql
	CREATE DATABASE backen_sapen CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
	```

4. Appliquer les migrations:

	```bash
	python manage.py migrate
	```

## Endpoints de base
- `GET /api/v1/health/`
- `GET /api/schema/`
- `GET /api/docs/`

## FastAPI (documentation et tests directs)
Une app FastAPI est disponible pour permettre aux developpeurs de visualiser et tester rapidement les endpoints.

1. Lancer FastAPI en local:

	```bash
	uvicorn fastapi_app.main:app --reload --port 8001
	```

2. Ouvrir la documentation interactive:

	- Swagger UI: http://127.0.0.1:8001/docs
	- ReDoc: http://127.0.0.1:8001/redoc
	- OpenAPI JSON: http://127.0.0.1:8001/openapi.json

3. Lancer les tests FastAPI:

	```bash
	pytest tests/fastapi -q
	```
