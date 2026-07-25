export const SIGMA_TOKENS = Object.freeze({
  radius: { sm: 10, md: 16, lg: 24 },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  typography: { family: 'Inter, ui-sans-serif, system-ui, sans-serif' },
  semantic: { primary: '#6557f5', surface: '#ffffff', canvas: '#f4f6fb', text: '#192038' }
});

export function token(path) {
  return path.split('.').reduce((value, part) => value?.[part], SIGMA_TOKENS);
}
