# Projet Web - S2 - ING1 - 2024/2025
## Branche principale : `main`
- **Règle importante :** Ne jamais effectuer de commits directement sur la branche `main`.

---

## Étape 1 : Cloner le dépôt
1. Clonez la branche principale du dépôt :
   ```bash
   git clone https://github.com/guinat/cytech-project-web-s2-ing1-20242025.git
   ```

2. Déplacez-vous dans le dossier cloné :
   ```bash
   cd cytech-project-web-s2-ing1-20242025
   ```

---

## Étape 2 : Créer une branche pour chaque fonctionnalité
1. Depuis la branche principale (`main`), créez une nouvelle branche pour travailler sur une fonctionnalité spécifique :
   ```bash
   git checkout -b nom_de_la_fonctionnalite
   ```

---

## Étape 3 : Commits sur une branche
1. Ajoutez vos modifications à l'index de Git :
   ```bash
   git add .
   ```

2. Enregistrez vos changements avec un message clair en suivant le format :
   ```bash
   git commit -m "add|update|fix|feat|remove ... : description du changement"
   ```

3. Poussez vos modifications vers le dépôt distant :
   ```bash
   git push origin nom_de_la_fonctionnalite
   ```

---

## Étape 4 : Synchronisation avec la branche principale
1. **Avant de créer une nouvelle branche,** assurez-vous que votre copie locale de `main` est à jour :
   - Retournez sur la branche principale :
     ```bash
     git checkout main
     ```
   - Récupérez les dernières modifications de la branche principale :
     ```bash
     git pull origin main
     ```

2. Vous pouvez maintenant créer une nouvelle branche pour une nouvelle fonctionnalité (retour à l'étape 2).

---

## Étape 5 : Standards à respecter

1. **Code commenté :**
   - **Ajoutez des commentaires clairs et pertinents** dans votre code pour expliquer les sections complexes ou la logique.

2. **Langue utilisée :**
   - **Tout le code, les commentaires, et les messages de commit doivent être écrits en anglais** 

---

## Bonnes pratiques supplémentaires
- **Nommez vos branches de manière explicite** pour refléter leur contenu. Exemple : `feature/login-page`, `fix/bug-authentication`.
- **Faites des commits réguliers** pour garder un historique clair et compréhensible.
