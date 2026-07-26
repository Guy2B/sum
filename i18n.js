/* SIGMA-I18N-UNDEFINED-KEY-GUARD-719 */
function __sigmaSafeGetByPath719(object, path) {
  if (!object || typeof path !== "string" || !path.trim()) return undefined;
  return path.split(".").reduce((value, segment) => {
    if (value === null || value === undefined) return undefined;
    return value[segment];
  }, object);
}

'use strict';
(() => {
  const supported = ['en', 'fr', 'de', 'es'];
  let current = 'en';

  function getByPath(object, path) {
  return __sigmaSafeGetByPath719(object, path);
})();
