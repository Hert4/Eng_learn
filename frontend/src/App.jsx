
import { Routes, Route, Navigate } from "react-router-dom"
import AuthPage from "./pages/AuthPage"
import Page from './pages/Page'
import FloatingLogo from "./components/FloatingLogo"
import HomePage from "./pages/HomePage_re"
import { Box, Container, Stack } from "@chakra-ui/react"
import Header from "./components/Header"
import Footer from "./components/Footer"
import { useRecoilValue } from "recoil"
import userAtom from "./atom/userAtom"
import UserPage from "./pages/UserPage"
function App() {

  const user = useRecoilValue(userAtom)
  return (
    <Box position="relative" w="full">
      {user && (<Header user={user} />)}

      <Routes>
        <Route path="/" element={user ? <Page /> : <Navigate to="/auth" />} />
        <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
        <Route path="/:username" element={<UserPage />} />
      </Routes>
      <FloatingLogo />
    </Box>
  )
}

export default App
