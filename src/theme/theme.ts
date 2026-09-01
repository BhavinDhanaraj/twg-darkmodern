import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

// Emerald futuristic palette
const emerald = {
  50: '#ecfdf5',
  100: '#d1fae5',
  200: '#a7f3d0',
  300: '#6ee7b7',
  400: '#34d399',
  500: '#10b981',
  600: '#059669',
  700: '#047857',
  800: '#065f46',
  900: '#064e3b',
};

const brand = emerald;

const semanticTokens = {
  colors: {
    'bg-app': { default: '#070B12', _dark: '#070B12' },
    'bg-card': { default: 'rgba(13, 20, 33, 0.72)', _dark: 'rgba(13, 20, 33, 0.72)' },
    'bg-card-elevated': { default: 'rgba(18, 28, 45, 0.85)', _dark: 'rgba(18, 28, 45, 0.85)' },
    'bg-hover': { default: 'rgba(255, 255, 255, 0.05)', _dark: 'rgba(255, 255, 255, 0.05)' },
    'bg-selected': { default: 'rgba(16, 185, 129, 0.12)', _dark: 'rgba(16, 185, 129, 0.12)' },
    'text-main': { default: '#F8FAFC', _dark: '#F8FAFC' },
    'text-muted': { default: '#94A3B8', _dark: '#94A3B8' },
    'text-subtle': { default: '#64748B', _dark: '#64748B' },
    'text-dim': { default: '#475569', _dark: '#475569' },
    'border-subtle': { default: 'rgba(255, 255, 255, 0.08)', _dark: 'rgba(255, 255, 255, 0.08)' },
    'border-strong': { default: 'rgba(255, 255, 255, 0.18)', _dark: 'rgba(255, 255, 255, 0.18)' },
    'brand-text': { default: '#34D399', _dark: '#34D399' },
    'brand-border': { default: '#10B981', _dark: '#10B981' },
    'brand-hover': { default: '#059669', _dark: '#059669' },
    'brand-subtle-bg': { default: 'rgba(16, 185, 129, 0.1)', _dark: 'rgba(16, 185, 129, 0.1)' },
    'brand-subtle-border': { default: 'rgba(16, 185, 129, 0.3)', _dark: 'rgba(16, 185, 129, 0.3)' },
    'blue-subtle-bg': { default: 'rgba(6, 182, 212, 0.1)', _dark: 'rgba(6, 182, 212, 0.1)' },
    'blue-subtle-border': { default: 'rgba(6, 182, 212, 0.3)', _dark: 'rgba(6, 182, 212, 0.3)' },
    'blue-text': { default: '#38BDF8', _dark: '#38BDF8' },
    'kpi-healthy': { default: '#34D399', _dark: '#34D399' },
    'kpi-risk': { default: '#F43F5E', _dark: '#F43F5E' },
    'kpi-warn': { default: '#FBBF24', _dark: '#FBBF24' },
  },
};

const fonts = {
  heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
  mono: `'JetBrains Mono', 'Fira Code', monospace`,
};

const styles = {
  global: {
    'html, body': {
      bg: '#070B12',
      color: '#F8FAFC',
      fontFamily: `'Inter', sans-serif`,
    },
  },
};

const components = {
  Card: {
    baseStyle: {
      container: {
        borderRadius: '12px',
        boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08), 0 8px 32px 0 rgba(0, 0, 0, 0.36)',
        bg: 'rgba(13, 20, 33, 0.72)',
        backdropFilter: 'blur(20px)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: '1px',
      },
    },
  },

  Heading: {
    baseStyle: {
      fontFamily: `'Inter', sans-serif`,
      fontWeight: '700',
      color: '#F8FAFC',
      letterSpacing: '-0.02em',
    },
  },

  Stat: {
    baseStyle: {
      number: { fontFamily: `'Inter', sans-serif`, fontWeight: '700', color: '#F8FAFC' },
      label: { fontFamily: `'Inter', sans-serif`, fontWeight: '600', color: '#94A3B8', fontSize: 'xs' },
      helpText: { fontFamily: `'Inter', sans-serif`, color: '#64748B' },
    },
  },

  Button: {
    baseStyle: {
      fontFamily: `'Inter', sans-serif`,
      borderRadius: '8px',
      fontWeight: '600',
      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    variants: {
      outline: {
        color: '#E2E8F0',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        bg: 'rgba(255, 255, 255, 0.03)',
        _hover: {
          bg: 'rgba(255, 255, 255, 0.08)',
          borderColor: 'rgba(255, 255, 255, 0.25)',
        },
      },
      solid: {
        bg: '#10B981',
        color: '#070B12',
        fontWeight: '700',
        _hover: {
          bg: '#34D399',
          boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
        },
      },
      glass: {
        bg: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#F8FAFC',
        _hover: {
          bg: 'rgba(255, 255, 255, 0.12)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
        },
      },
    },
    defaultProps: { colorScheme: 'brand' },
  },

  Input: {
    baseStyle: {
      field: {
        fontFamily: `'Inter', sans-serif`,
        color: '#F8FAFC',
        bg: 'rgba(9, 14, 24, 0.7)',
        borderRadius: '8px',
      },
    },
    variants: {
      outline: {
        field: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
          _focus: {
            borderColor: '#10B981',
            boxShadow: '0 0 0 1px #10B981, 0 0 12px rgba(16, 185, 129, 0.25)',
          },
          _hover: { borderColor: 'rgba(255, 255, 255, 0.18)' },
        },
      },
    },
    defaultProps: { focusBorderColor: 'brand.500' },
  },

  Select: {
    baseStyle: {
      field: {
        fontFamily: `'Inter', sans-serif`,
        color: '#F8FAFC',
        bg: 'rgba(9, 14, 24, 0.85)',
        borderRadius: '8px',
        '> option, > optgroup': {
          bg: '#0D1421',
          color: '#F8FAFC',
        },
      },
    },
    variants: {
      outline: {
        field: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
          _focus: {
            borderColor: '#10B981',
            boxShadow: '0 0 0 1px #10B981, 0 0 12px rgba(16, 185, 129, 0.25)',
          },
          _hover: { borderColor: 'rgba(255, 255, 255, 0.18)' },
        },
      },
    },
    defaultProps: { focusBorderColor: 'brand.500' },
  },

  Textarea: {
    baseStyle: {
      fontFamily: `'Inter', sans-serif`,
      color: '#F8FAFC',
      bg: 'rgba(9, 14, 24, 0.7)',
      borderRadius: '8px',
    },
    variants: {
      outline: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        _focus: {
          borderColor: '#10B981',
          boxShadow: '0 0 0 1px #10B981, 0 0 12px rgba(16, 185, 129, 0.25)',
        },
        _hover: { borderColor: 'rgba(255, 255, 255, 0.18)' },
      },
    },
    defaultProps: { focusBorderColor: 'brand.500' },
  },

  Table: {
    variants: {
      simple: {
        th: {
          fontFamily: `'Inter', sans-serif`,
          py: 3.5,
          color: '#94A3B8',
          fontWeight: '600',
          fontSize: '11px',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        },
        td: {
          fontFamily: `'Inter', sans-serif`,
          py: 3.5,
          color: '#E2E8F0',
          borderColor: 'rgba(255, 255, 255, 0.06)',
        },
      },
    },
  },

  Badge: {
    baseStyle: {
      fontFamily: `'Inter', sans-serif`,
      borderRadius: '4px',
      px: 2,
      py: 0.5,
      fontWeight: '700',
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      fontSize: '10px',
    },
  },

  Tooltip: {
    baseStyle: {
      fontFamily: `'Inter', sans-serif`,
      fontSize: 'xs',
      bg: '#0F172A',
      color: '#F8FAFC',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '6px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    },
  },

  Alert: {
    baseStyle: {
      container: {
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
      },
    },
  },
};

export const theme = extendTheme({
  config,
  semanticTokens,
  colors: { brand, emerald },
  fonts,
  styles,
  components,
});
