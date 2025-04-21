
import { Routes, Route } from "react-router-dom"
import AuthPage from "./pages/AuthPage"
import Page from './pages/Page'
import FloatingLogo from "./components/FloatingLogo"
import HomePage from "./pages/HomePage"
import { Box, Container } from "@chakra-ui/react"
import Header from "./components/Header"
import Footer from "./components/Footer"
function App() {

  // 
  return (
    <Box position={'relative'} w={'full'}>
      <Header />
      <Routes>
        {/* <Route path="/" element={<HomePage />} /> */}
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
      <FloatingLogo /> {/* Logo nằm góc phải */}
      {/* <Footer /> */}
    </Box>
  )
}

export default App
