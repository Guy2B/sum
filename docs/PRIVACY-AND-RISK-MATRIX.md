# Matrice confidentialité et risques

| Domaine/capacité | Sensibilité | Risque principal | Contrôles requis | État actuel |
|---|---:|---|---|---|
| Identité | Élevée | usurpation, fuite de profil | auth forte, séparation workspace, audit | Partiel |
| Emails | Élevée | contenu privé et jetons | moindre privilège, chiffrement, rétention | Partiel |
| Calendrier | Élevée | localisation et habitudes | scopes minimaux, masquage, consentement | Partiel |
| Knowledge Graph | Très élevée | agrégation révélant davantage que chaque source | ACL par nœud/relation, vues filtrées | Prototype |
| Mémoire | Très élevée | inférences persistantes erronées | preuve, confiance, correction, oubli | Prototype |
| Agents | Critique | action externe indésirable | policy serveur, approbation, idempotence, audit | Prototype |
| Social | Élevée | profilage, conformité plateformes | opt-in, limites, suppression, provenance | Partiel |
| Local AI | Élevée | fuite de contexte aux modèles | choix modèle, redaction, journal de transfert | Partiel |
| Santé | Critique | dommage ou diagnostic implicite | séparation, chiffrement, prudence, professionnel | Prototype |
| Enfants/école | Critique | profilage de mineurs, stigmatisation | contrôle parental, langage neutre, consentement adapté | Absent |
| Emploi | Très élevée | discrimination et automatisation abusive | explication, contrôle humain, audit des critères | Absent |
| Finance | Très élevée | fraude, exposition financière | chiffrement, read-only par défaut, audit | Prototype |
| Documents | Très élevée | contrats/secrets | classification, DLP, ACL source | Absent/Prototype |
| Entitlements | Élevée | contournement commercial | validation serveur et signatures | Absent |

## Niveaux de confidentialité proposés

```text
public
personal
private
sensitive
restricted-health
restricted-child
restricted-employment
```

## Exigences générales

- Export et suppression complets par propriétaire.
- Rétention configurable par source et catégorie.
- Journal des accès aux données sensibles.
- Séparation stricte entre fait, estimation et recommandation.
- Toute inférence est corrigeable et conserve les preuves qui la soutiennent.
- Actions externes désactivées par défaut.
- Secrets exclus du dépôt et des stockages navigateur.
- Contrôle d’entitlement côté serveur, jamais uniquement dans l’interface.
