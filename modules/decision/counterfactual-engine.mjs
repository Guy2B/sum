export function buildCounterfactuals(ranked = []) {
  return ranked.slice(0, 3).map(item => {
    const option = item.option;
    if (option.id === 'do-now') {
      return {
        optionId: option.id,
        statement: 'En agissant maintenant, le risque de retard diminue mais du temps est consommé immédiatement.',
      };
    }
    if (option.id === 'schedule') {
      return {
        optionId: option.id,
        statement: 'En planifiant, la charge immédiate baisse mais le risque lié au délai augmente.',
      };
    }
    if (option.id === 'delegate') {
      return {
        optionId: option.id,
        statement: 'En déléguant, votre effort baisse mais le résultat dépend d’un tiers.',
      };
    }
    return {
      optionId: option.id,
      statement: 'En ignorant, aucun effort n’est requis mais le risque résiduel reste entier.',
    };
  });
}
