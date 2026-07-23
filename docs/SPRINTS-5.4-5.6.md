# Sigma Intelligence — Sprints 5.4 à 5.6

## 5.4 Today Engine V2
Crée une projection quotidienne stable, répartie entre : à faire maintenant, réponses, échéances, opportunités, préparation et revue. La capacité est exprimée en minutes. Le document Firestore ne duplique pas le contenu sensible : il conserve uniquement les identifiants de signaux.

## 5.5 Memory Engine
Dérive uniquement des préférences observées dans l’historique d’audit. Une mémoire exige au moins trois observations. Chaque entrée conserve son nombre d’observations, sa confiance et sa provenance `observed_history`. Aucune préférence n’est inventée.

## 5.6 Action Engine V2
Transforme une recommandation approuvée en artefact contrôlé. Les réponses et opérations de calendrier restent des brouillons sans effet externe. Les idées de contenu ne sont jamais publiées. L’exécution produit un audit et un `actionArtifact`, jamais un envoi, une publication ou une écriture calendrier automatique.
