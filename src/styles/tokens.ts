// Design Tokens centralizados


export interface ColorTokens {
  bg: string;
  bgAlt: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  danger: string;
  success: string;
  gradientAccent: string; // usado em headings
}

export interface RadiusTokens { sm: string; md: string; lg: string; full: string; }
export interface SpaceTokens { xs: string; sm: string; md: string; lg: string; xl: string; }
export interface ShadowTokens { soft: string; focus: string; }

export interface DesignTokens {
  color: ColorTokens;
  radius: RadiusTokens;
  space: SpaceTokens;
  shadow: ShadowTokens;
}

export const tokens: DesignTokens = {
  color: {
    bg: 'var(--color-bg)',
    bgAlt: 'var(--color-bg-alt)',
    surface: 'var(--color-surface)',
    border: 'var(--color-border)',
    text: 'var(--color-text)',
    textMuted: 'var(--color-text-muted)',
    accent: 'var(--color-accent)',
    accentSoft: 'var(--color-accent-soft)',
    danger: 'var(--color-danger)',
    success: 'var(--color-success)',
    gradientAccent: 'var(--gradient-accent)'
  },
  radius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    full: '9999px'
  },
  space: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  shadow: {
    soft: '0 1px 2px 0 rgba(0,0,0,0.4)',
    focus: '0 0 0 2px #10b98166'
  }
};

// Helper para acesso seguro tipado
export type TokenCategory = keyof DesignTokens;
export function getToken<K extends TokenCategory>(cat: K): DesignTokens[K] {
  return tokens[cat];
}
