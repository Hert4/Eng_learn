import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { mode } from '@chakra-ui/theme-tools';
import { extendTheme } from '@chakra-ui/theme-utils';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { RecoilRoot } from 'recoil';

const styles = {
  global: (props) => ({
    body: {
      color: mode('gray.800', 'whiteAlpha.900')(props),
      bg: mode("gray.100", '#101010')(props),
    },
  }),
};

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const colors = {
  gray: {
    light: '#616161',
    dark: '#1e1e1e'
  },
};

const theme = extendTheme({ config, styles, colors })


createRoot(document.getElementById('root')).render(
  // React.StrictMode renders every components twice on development 
  <React.StrictMode>
    <RecoilRoot >
      <BrowserRouter>
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <App />

        </ChakraProvider>
      </BrowserRouter>
    </RecoilRoot>


  </React.StrictMode>,
)
