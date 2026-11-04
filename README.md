# EPC-Consulting - site web

Site statique (HTML / CSS / JS), sans build. Prêt pour Vercel.

## Déployer sur Vercel
1. Dézippez le dossier, puis déposez-le sur GitHub (ou utilisez `vercel` en ligne de commande depuis ce dossier).
2. Sur vercel.com : *Add New > Project*, importez le dépôt. Framework Preset : **Other**. Aucune commande de build, laissez *Output Directory* vide.
3. Ajoutez le domaine www.epc-consulting.com dans *Settings > Domains*.

## Ajouter les photos de projets
Déposez une image JPG nommée comme l'identifiant du projet dans `assets/img/projets/` :
`charpente-cabine.jpg`, `station-traitement-eau-potable.jpg`, `terrain-multisport.jpg`,
`salle-de-meeting.jpg`, `amenagement-barbecue.jpg`, `camera-tower-pylon.jpg`, `parking-ambulance.jpg`,
`civil-work-for-cctv.jpg`, `engineering.jpg`, `maintenances.jpg`, `procurement.jpg`.
Elles s'affichent automatiquement sur la page Projets (format conseillé : 1200 x 900 px).

## Galerie photo d'un projet
Cliquer sur une vignette de projet ouvre un diaporama (flèches, clavier, glissement sur mobile, miniatures).
Pour ajouter une galerie à un projet (exemple : `charpente-cabine`) :
1. Créez le dossier `assets/img/projets/<identifiant>/` avec les photos numérotées `1.jpg`, `2.jpg`, `3.jpg`… (1600 px de large max.) et leurs petites versions `1-s.jpg`, `2-s.jpg`… (320 px de large).
2. Ajoutez la photo de couverture de la vignette dans le même dossier : `assets/img/projets/<identifiant>/cover.jpg` (copie de `1.jpg`, 1200 px de large).
3. Dans `projets.html` (et `index.html` si le projet y figure), ajoutez `data-photos="N"` (N = nombre de photos) sur la balise `<figure class="tile" data-slug="<identifiant>" …>`.

## Modifier les textes
Chaque page est un fichier HTML à la racine : `index.html`, `a-propos.html`, `services.html`, `projets.html`, `contact.html`.
Couleurs et polices : variables en haut de `assets/css/style.css`.

## Langues (FR / EN / AR)
Le site est disponible en français (langue de base), en anglais et en arabe (affichage de droite à gauche).
- Le sélecteur **FR · EN · عربية** est dans l'en-tête (sur mobile : dans le menu ouvert). Le choix est mémorisé sur l'appareil du visiteur.
- Lien direct vers une langue : `contact.html?lang=en` ou `contact.html?lang=ar`.
- Le HTML reste en français. Les traductions sont dans **`assets/js/translations.js`** : une ligne par texte, `[français, anglais, arabe]`.
- **Pour modifier un texte** : changez le français dans la page HTML **et** dans la ligne correspondante de `translations.js` (le texte français sert de clé). Un texte sans ligne reste simplement en français.
- Le message WhatsApp / e-mail du formulaire de contact est rédigé dans la langue choisie par le visiteur.
- Moteur : `assets/js/i18n.js`. Styles arabe / RTL et sélecteur : fin de `assets/css/style.css`. Police arabe : Almarai (`assets/fonts/almarai-*.woff2`, licence OFL), utilisée uniquement en arabe.
