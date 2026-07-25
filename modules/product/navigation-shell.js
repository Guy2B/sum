const ROUTES = ['today', 'goals', 'tasks', 'plan', 'reviews'];
export function normalizeRoute(route = 'today') { return ROUTES.includes(route) ? route : 'today'; }
export function createNavigationState(route = 'today') {
  let active = normalizeRoute(route);
  return { get active(){ return active; }, navigate(next){ active = normalizeRoute(next); return active; }, routes:[...ROUTES] };
}
