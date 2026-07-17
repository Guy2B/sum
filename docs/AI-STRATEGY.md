# Stratégie d'intelligence de Σ

Σ fonctionne toujours avec un moteur déterministe : règles, calculs et données croisées. Cette couche reste disponible hors ligne et ne dépend d'aucun fournisseur.

La version 1.5.1 ajoute une option d'IA locale basée sur l'API `LanguageModel` du navigateur lorsqu'elle est disponible. L'IA reformule uniquement une réponse déterministe et reçoit un résumé structuré des données. Elle ne doit pas inventer de chiffres, poser de diagnostic ou fournir un conseil juridique/fiscal.

Ordre de priorité recommandé :

1. moteur déterministe et outils internes ;
2. classification locale et recherche documentaire avec Transformers.js ;
3. modèle génératif local facultatif ;
4. fournisseur cloud optionnel uniquement si le client l'accepte et si le modèle économique le finance.

Le fallback doit toujours rester le moteur guidé.
