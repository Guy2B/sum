# Sigma Life OS V1.7.1 RC1 — rapport de préparation

## Statut
Cette archive est une **Release Candidate de bêta**, pas une publication commerciale. Le cœur local/PWA est testable. Les services externes nécessitant des comptes, secrets ou signatures restent désactivés tant qu’ils ne sont pas configurés.

## Corrections intégrées
- Version harmonisée en `1.7.1-rc1` dans l’application, le paquet et le cache PWA.
- Mode Admin QA désactivé par défaut.
- Ajout d’un contrôle `npm run rc:check` distinct du contrôle commercial.
- Correction responsive des titres, badges Premium, cartes, modales et rangées de boutons sur mobile.
- Apple Health/Apple Watch : suppression de la fausse connexion automatique lorsque le pont natif est absent.
- Une synchronisation native vide ou en erreur ne remplace plus silencieusement les données par une démonstration.
- L’import de démonstration reste disponible explicitement pour tester l’interface sans appareil.

## Fonctionnalités testables dans RC1
- PWA locale et hors ligne.
- Onboarding, contexte, objectifs, tâches, projets, habitudes, calendrier local, journal, finance locale, apprentissage et coach guidé/local.
- Éditions et restrictions Premium dans le parcours produit.
- Import manuel santé et import de démonstration explicite.
- Ponts natifs iOS HealthKit et Android Health Connect présents dans le dépôt.

## Fonctions nécessitant une configuration externe
- Apple Watch réelle : compilation iOS sur macOS, capacité HealthKit, textes `Info.plist`, signature Apple Developer et autorisation utilisateur.
- Android Health Connect : compilation/signature Android et permissions runtime.
- Paiement réel et portail client.
- Connecteurs mail, réseaux sociaux et calendrier distants.
- Identité légale, support et URLs publiques.

## Commandes de validation
```bash
npm run check
npm run rc:check
npm run serve
```
Puis ouvrir `http://localhost:8080/app.html`.

## Critères avant bêta publique
1. Tester les parcours principaux sur Chrome, Safari, Firefox et Edge.
2. Tester au minimum 390×844, 430×932, tablette et bureau.
3. Compiler l’application iOS et vérifier une lecture HealthKit sur appareil réel.
4. Vérifier qu’aucun bouton principal ne reste sans retour utilisateur.
5. Configurer seulement les connecteurs inclus dans le périmètre du test.

## Limite importante
La RC1 ne prétend pas rendre actifs des services externes sans identifiants, backend ou compte développeur. Elle distingue désormais clairement les fonctions natives, les fonctions locales et les démonstrations.
