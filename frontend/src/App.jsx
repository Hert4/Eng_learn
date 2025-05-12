import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Page from './pages/Page';
import { Box } from '@chakra-ui/react';
import Header from './components/Header';
import { useRecoilValue } from 'recoil';
import userAtom from './atom/userAtom';
import UserPage from './pages/UserPage';
import SurveyPage from './pages/SurveyPage';
import { useEffect, useMemo, useState } from 'react';
import TestPage from './pages/TestPage';
import FaqPage from './pages/FaqPage';
import FloatingLogo from './components/FloatingLogo';
import HomePage from './pages/HomePage';

function App() {
  const user = useRecoilValue(userAtom);
  const location = useLocation();
  const [showHeader, setShowHeader] = useState(false);

  const noHeaderRoutes = useMemo(() => ['/auth'], []);

  useEffect(() => {
    setShowHeader(user && !noHeaderRoutes.includes(location.pathname));
  }, [location.pathname, user, noHeaderRoutes]);

  return (
    <Box w="full" >
      {showHeader && <Header user={user} />}
      <Box
        pt={showHeader ? { base: '60px', md: '70px' } : '0'}
      >
        <Routes>
          <Route path="/" element={user ? <HomePage /> : <Navigate to="/auth" />} />
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
          <Route path="/:username" element={<UserPage />} />
          <Route path="/exercise" element={<SurveyPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/faq" element={<FaqPage />} />
        </Routes>
      </Box>

      {/* {user && <AIModal currentUser={user} />} */}
      {/* <Live2DComponent /> */}
    </Box>
  );
}

export default App;