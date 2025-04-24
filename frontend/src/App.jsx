import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import AuthPage from "./pages/AuthPage"
import Page from './pages/Page'
import { Box } from "@chakra-ui/react"
import Header from "./components/Header"
import { useRecoilValue } from "recoil"
import userAtom from "./atom/userAtom"
import UserPage from "./pages/UserPage"
import SurveyPage from "./pages/SurveyPage"
import { useEffect, useMemo, useState } from "react"

function App() {
  const user = useRecoilValue(userAtom)
  const location = useLocation()
  const [showHeader, setShowHeader] = useState(false)

  // Danh sách các route không hiển thị header
  const noHeaderRoutes = useMemo(() => ['/auth'], [])

  useEffect(() => {
    // Kiểm tra xem route hiện tại có trong danh sách noHeaderRoutes không
    setShowHeader(user && !noHeaderRoutes.includes(location.pathname))
  }, [location.pathname, user, noHeaderRoutes])

  return (
    <Box position="relative" w="full" minHeight="100vh">
      {/* Header chỉ hiển thị khi cần */}
      {showHeader && <Header user={user} />}

      {/* Main content với padding linh hoạt */}
      <Box
        pt={showHeader ? { base: "60px", md: "70px" } : "0"}
        minHeight={showHeader ? "calc(100vh - 70px)" : "100vh"}
      >
        <Routes>
          <Route path="/" element={user ? <Page /> : <Navigate to="/auth" />} />
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
          <Route path="/:username" element={<UserPage />} />
          <Route path="/exercise" element={<SurveyPage />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default App