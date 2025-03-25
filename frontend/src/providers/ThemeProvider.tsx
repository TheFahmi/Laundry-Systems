'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Tema mode
type ThemeMode = 'light' | 'dark';

// Context untuk tema
interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

// Buat context untuk theme
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Custom hook untuk menggunakan theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Default mode is light, check localStorage for saved preference
  const [mode, setMode] = useState<ThemeMode>('light');

  // Load theme preference from localStorage on client side
  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode === 'dark' || savedMode === 'light') {
      setMode(savedMode);
    }
  }, []);

  // Theme toggle function
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  // Create theme based on current mode
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // Light mode colors
                primary: {
                  main: '#1976d2',
                },
                secondary: {
                  main: '#9c27b0',
                },
                background: {
                  default: '#f5f5f5',
                  paper: '#ffffff',
                },
              }
            : {
                // Dark mode colors
                primary: {
                  main: '#90caf9',
                },
                secondary: {
                  main: '#ce93d8',
                },
                background: {
                  default: '#121212',
                  paper: '#1e1e1e',
                },
              }),
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
} 