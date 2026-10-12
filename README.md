# Quand la nature bouge

Exposé interactif de cinq minutes, adapté au CE1 : séismes, tsunamis, éruptions volcaniques et tornades.

Style **bande dessinée** avec contours noirs et bruitages écrits. Les quatre moments de chaque animation peuvent être sélectionnés ou parcourus avec le curseur du temps.

La partie séismes propose quatre mouvements des plaques : **subduction**, **divergence**, **coulissage** et **collision continentale**. Les flèches indiquent les directions et une vue en coupe montre la plaque qui plonge. Le texte distingue le mouvement lent des plaques du glissement brusque à l’origine d’un séisme ; les montagnes sont présentées comme une formation sur des millions d’années.

Le tsunami se déroule sur une plage avec palmiers et parasol : retrait visible de la mer, arrivée de la vague et inondation du sable. Ce retrait est un scénario possible, pas une règle pour tous les tsunamis. Les mouvements sont volontairement amplifiés pour l’apprentissage.

## Présenter

Ouvrir la page, avancer avec les boutons ou les flèches du clavier, puis lancer l’animation de chaque phénomène. Le texte à dire et le geste suggéré se trouvent sous chaque étape.

Déroulé : introduction de 30 secondes, quatre étapes d’une minute, conclusion de 30 secondes. Les temps comprennent les animations et les pauses ; répéter avec un chronomètre.

Les mouvements sont des schémas pédagogiques simplifiés. La préférence système de réduction des animations remplace la lecture animée par des étapes fixes.

## Développement et publication

Page statique sans compilation. Les scènes sont rendues en **WebGL 2 avec Three.js 0.180.0**, fourni dans `vendor/` avec sa licence MIT. Les modules JavaScript nécessitent un serveur HTTP : lancer `node tools/serve.cjs`, puis ouvrir http://127.0.0.1:4173. Les polices Google sont facultatives : les polices système prennent le relais hors ligne.

Chaque push sur `main` déclenche `.github/workflows/pages.yml`. Dans les réglages du dépôt, GitHub Pages doit utiliser **GitHub Actions**.

Vérifications : `npm ci`, puis `npm test` (géométrie 3D, navigation, pause, reprise, réduction des animations et récupération du contexte). Les tests ne remplacent pas une vérification du rendu sur un navigateur compatible WebGL 2.

Site : https://gobeline-dev.github.io/catastrophes-naturelles/

Les sources scientifiques sont accessibles dans le bas de la page.
