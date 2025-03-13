# Guide d'installation et exécution du projet

Ce guide vous explique comment configurer et exécuter le projet. Suivez ces étapes dans l'ordre.

## Prérequis

- Git
- Python 3.x
- Node.js et npm
- Un terminal (PowerShell sur Windows, Terminal sur Linux/macOS)

## 1. Cloner le projet

```bash
git clone [URL_DU_PROJET]
cd [NOM_DU_DOSSIER_DU_PROJET]
```

## 2. Configuration du front-end

```bash
cd client
npm i
```

## 3. Configuration du back-end

### Création d'un environnement virtuel Python

#### Windows

```bash
python -m venv env
./env/Scripts/activate
```

#### Linux/macOS

```bash
python3 -m venv env
source ./env/bin/activate
```

> Note: Pour désactiver l'environnement virtuel, utilisez la commande `deactivate`

### Installation des dépendances Python

```bash
pip install -r requirements.txt
```

> Note: Sur certains systèmes, vous devrez peut-être utiliser `pip3` au lieu de `pip`

### Configuration de la base de données Django

```bash
python manage.py makemigrations
python manage.py migrate
```

> Note: Sur certains systèmes, vous devrez peut-être utiliser `python3` au lieu de `python`

### Création d'un super-utilisateur Django

```bash
python manage.py createsuperuser
```

Suivez les instructions pour créer un compte administrateur.

## 4. Exécuter le projet

### Démarrer le serveur back-end

Dans le dossier racine du projet, avec l'environnement virtuel activé :

```bash
python manage.py runserver
```

### Démarrer l'application front-end

Dans un nouveau terminal :

```bash
cd client
npm run dev
```

Vous pouvez maintenant accéder à l'application (http://localhost:5173/) !
