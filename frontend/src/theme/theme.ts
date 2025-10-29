import { createTheme, type ThemeOptions } from '@mui/material/styles';

const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'dark'
      ? {
          primary: {
            main: '#3B82F6',
            light: '#60A5FA',
            dark: '#2563EB',
          },
          secondary: {
            main: '#8B5CF6',
            light: '#A78BFA',
            dark: '#7C3AED',
          },
          background: {
            default: '#111827',
            paper: '#1F2937',
          },
          text: {
            primary: '#F9FAFB',
            secondary: '#D1D5DB',
          },
          divider: '#374151',
        }
      : {
          primary: {
            main: '#3B82F6',
            light: '#60A5FA',
            dark: '#2563EB',
          },
          secondary: {
            main: '#8B5CF6',
            light: '#A78BFA',
            dark: '#7C3AED',
          },
          background: {
            default: '#F9FAFB',
            paper: '#FFFFFF',
          },
          text: {
            primary: '#111827',
            secondary: '#6B7280',
          },
          divider: '#E5E7EB',
        }),
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
    body1: {
      fontSize: '0.9375rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: mode === 'dark' ? '#374151' : '#D1D5DB',
            borderRadius: '4px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
            transform: 'translateY(-1px)',
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backdropFilter: 'blur(8px)',
          backgroundColor: mode === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'dark' ? '#1F2937' : '#FFFFFF',
          borderRight: mode === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB',
          width: 240,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#1F2937' : '#FFFFFF',
          color: mode === 'dark' ? '#F9FAFB' : '#111827',
          boxShadow: mode === 'dark' 
            ? '0 1px 3px rgba(0, 0, 0, 0.3)' 
            : '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 6,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'dark'
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        },
      },
    },
  },
});

export const createAppTheme = (mode: 'light' | 'dark') => {
  return createTheme(getDesignTokens(mode));
};
