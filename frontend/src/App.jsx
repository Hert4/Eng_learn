
import { Routes, Route, Navigate } from "react-router-dom"
import AuthPage from "./pages/AuthPage"
import Page from './pages/Page'
import FloatingLogo from "./components/FloatingLogo"
import HomePage from "./pages/HomePage"
import { Box, Container, Stack } from "@chakra-ui/react"
import Header from "./components/Header"
import Footer from "./components/Footer"
import { useRecoilValue } from "recoil"
import userAtom from "./atom/userAtom"
function App() {

  // 
  const user = useRecoilValue(userAtom)
  return (
    <Box position="relative" w="full">
      <Header user={user} />
      <Routes>
        <Route path="/" element={user ? <Page /> : <Navigate to="/auth" />} />
        {/* <Route path="/" element={<HomePage />} /> */}

        <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
      </Routes>
      <FloatingLogo />
    </Box>
  )
}

export default App
