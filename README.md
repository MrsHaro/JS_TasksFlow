# To-Do List Application

## Description
Cette application de liste de tâches permet aux utilisateurs d'ajouter, de marquer comme terminées et de supprimer des tâches. Les tâches sont stockées dans le localStorage pour une persistance des données.

## Structure du projet
Le projet est organisé comme suit :

```
todo-list-app
├── src
│   ├── index.html        # Page principale de l'application
│   ├── css
│   │   └── styles.css    # Styles CSS pour l'application
│   ├── js
│   │   ├── app.js        # Logique principale de l'application
│   │   └── storage.js     # Gestion du localStorage
│   └── components
│       └── todo-item.js   # Classe représentant une tâche individuelle
├── package.json           # Configuration npm
├── .gitignore             # Fichiers à ignorer par Git
└── README.md              # Documentation du projet
```

## Installation
1. Clonez le dépôt :
   ```
   git clone <URL_DU_DEPOT>
   ```
2. Accédez au répertoire du projet :
   ```
   cd todo-list-app
   ```
3. Installez les dépendances :
   ```
   npm install
   ```

## Utilisation
1. Ouvrez `src/index.html` dans votre navigateur.
2. Ajoutez des tâches dans le champ de saisie.
3. Cliquez sur le bouton pour ajouter la tâche à la liste.
4. Marquez les tâches comme terminées en cliquant sur la case à cocher.
5. Supprimez les tâches en cliquant sur le bouton de suppression.

## Contribuer
Les contributions sont les bienvenues ! Veuillez soumettre une demande de tirage pour toute amélioration ou correction de bogue.

## License
Ce projet est sous licence MIT.
