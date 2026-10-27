# EPC-Consulting - site web

Site statique (HTML / CSS / JS), sans build. Prêt pour Vercel.

## Déployer sur Vercel
1. Dézippez le dossier, puis déposez-le sur GitHub (ou utilisez `vercel` en ligne de commande depuis ce dossier).
2. Sur vercel.com : *Add New > Project*, importez le dépôt. Framework Preset : **Other**. Aucune commande de build, laissez *Output Directory* vide.
3. Ajoutez le domaine www.epc-consulting.com dans *Settings > Domains*.

## Ajouter les photos de projets
Déposez une image JPG nommée comme l'identifiant du projet dans `assets/img/projets/` :
`charpente-cabine.jpg`, `station-traitement-eau-potable.jpg`, `design-interieur.jpg`, `terrain-multisport.jpg`,
`salle-de-meeting.jpg`, `amenagement-barbecue.jpg`, `camera-tower-pylon.jpg`, `parking-ambulance.jpg`,
`civil-work-for-cctv.jpg`, `engineering.jpg`, `maintenances.jpg`, `procurement.jpg`.
Elles s'affichent automatiquement sur la page Projets (format conseillé : 1200 x 900 px).

## Modifier les textes
Chaque page est un fichier HTML à la racine : `index.html`, `a-propos.html`, `services.html`, `projets.html`, `contact.html`.
Couleurs et polices : variables en haut de `assets/css/style.css`.
