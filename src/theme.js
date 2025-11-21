import { createTheme } from '@mui/material/styles';

// Airbnb 风格的主题配置
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF385C', // Airbnb 的经典粉红色
      light: '#FF5A5F',
      dark: '#E61E4D',
      contrastText: '#fff',
    },
    secondary: {
      main: '#00A699', // Airbnb 的青绿色
      light: '#00B3A6',
      dark: '#008A80',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#484848', // Airbnb 的主要文字颜色
      secondary: '#767676',
    },
    divider: '#EBEBEB',
  },
  typography: {
    fontFamily: [
      'Circular',
      '-apple-system',
      'BlinkMacSystemFont',
      'Roboto',
      '"Helvetica Neue"',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#484848',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#484848',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#484848',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#484848',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#484848',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#484848',
    },
    body1: {
      fontSize: '1rem',
      color: '#484848',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#767676',
    },
    button: {
      textTransform: 'none', // Airbnb 不使用全大写按钮
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12, // Airbnb 使用较大的圆角
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.08)',
    '0px 4px 8px rgba(0,0,0,0.12)',
    '0px 6px 16px rgba(0,0,0,0.12)',
    '0px 8px 16px rgba(0,0,0,0.16)',
    '0px 10px 20px rgba(0,0,0,0.19)',
    '0px 12px 24px rgba(0,0,0,0.22)',
    '0px 14px 28px rgba(0,0,0,0.25)',
    '0px 16px 32px rgba(0,0,0,0.28)',
    '0px 18px 36px rgba(0,0,0,0.31)',
    '0px 20px 40px rgba(0,0,0,0.34)',
    '0px 22px 44px rgba(0,0,0,0.37)',
    '0px 24px 48px rgba(0,0,0,0.40)',
    '0px 26px 52px rgba(0,0,0,0.43)',
    '0px 28px 56px rgba(0,0,0,0.46)',
    '0px 30px 60px rgba(0,0,0,0.49)',
    '0px 32px 64px rgba(0,0,0,0.52)',
    '0px 34px 68px rgba(0,0,0,0.55)',
    '0px 36px 72px rgba(0,0,0,0.58)',
    '0px 38px 76px rgba(0,0,0,0.61)',
    '0px 40px 80px rgba(0,0,0,0.64)',
    '0px 42px 84px rgba(0,0,0,0.67)',
    '0px 44px 88px rgba(0,0,0,0.70)',
    '0px 46px 92px rgba(0,0,0,0.73)',
    '0px 48px 96px rgba(0,0,0,0.76)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '1rem',
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 8px rgba(0,0,0,0.12)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
