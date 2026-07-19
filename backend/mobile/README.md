# Applications mobiles Σ V1.7

Ce dossier fournit le contrat Capacitor et les ponts natifs nécessaires aux données santé.

- iOS : le plugin Swift utilise réellement HealthKit pour demander l'autorisation et lire sommeil, pas, énergie active, fréquence cardiaque au repos et HRV. Il nécessite l'activation de la capacité HealthKit dans Xcode et les textes d'autorisation dans `Info.plist`.
- Android : le lecteur Health Connect contient la base d'accès réelle. Le flux de permissions et le pont coroutine doivent être finalisés dans Android Studio.
- Samsung : la distribution exige le SDK officiel `samsung-health-data-api.aar`, l'enregistrement du package/signature et l'approbation partenaire. Le point d'intégration est inclus sans redistribuer l'AAR propriétaire.

Les boutons santé du web détectent automatiquement `Capacitor.Plugins.SigmaHealth`. Sans application native, ils restent en mode démonstration explicite.
