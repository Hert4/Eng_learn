import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import { RecoilRoot } from 'recoil';


localStorage.removeItem('chakra-ui-color-mode');

const config = {
  initialColorMode: 'light', // Mặc định trắng
  useSystemColorMode: false,
};

const style = {
  global: (props) => ({
    body: {
      color: mode('gray.800', 'whiteAlpha.900')(props), // Màu chữ
      bg: mode('white', '#101010')(props), // Màu nền
    },
  }),
};

const colors = {
  gray: {
    light: '#616161',
    dark: '#1e1e1e',
  },
};

const theme = extendTheme({ config, style, colors });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RecoilRoot>
      <BrowserRouter>
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <App />
        </ChakraProvider>
      </BrowserRouter>
    </RecoilRoot>

  </StrictMode>
);
