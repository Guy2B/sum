# Sources santé

Les cartes Apple Health, Health Connect, Samsung Health et Huawei Health sont interactives dans la version web : elles permettent de tester la connexion, l'état et l'import de mesures de démonstration.

La synchronisation réelle nécessite une application mobile complémentaire et le consentement explicite de l'utilisateur :

- iOS/watchOS : HealthKit / Apple Health ;
- Android : Health Connect ;
- Samsung : Samsung Health Data SDK selon les conditions du programme ;
- Huawei : Huawei Health Kit selon les autorisations disponibles.

Le frontend prévoit un pont `window.SUM_NATIVE_HEALTH.connect(provider)` pour la future application mobile. Les indicateurs de SUM sont informatifs et ne constituent pas un diagnostic médical.
