import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Page from './pages/Page';
import { Box, Image } from '@chakra-ui/react';
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
import AIModal from './components/AIModel';




function App() {
  const user = useRecoilValue(userAtom);
  const location = useLocation();
  const [showHeader, setShowHeader] = useState(false);
  // const [loading, setLoading] = useState(true);

  const noHeaderRoutes = useMemo(() => ['/auth'], []);

  useEffect(() => {
    setShowHeader(user && !noHeaderRoutes.includes(location.pathname));
  }, [location.pathname, user, noHeaderRoutes]);

  // useEffect(() => {
  //   const timer = setTimeout(() => setLoading(false), 4800);
  //   return () => clearTimeout(timer);
  // }, []);

  // if (loading) {
  //   return (
  //     <Box
  //       w="100vw"
  //       h="100vh"
  //       display="flex"
  //       alignItems="center"
  //       justifyContent="center"
  //       bg="pink.100"


  //     >
  //       <Image src="/loading.gif" alt="Loading..." boxSize="200px" borderRadius="full" />
  //     </Box>
  //   );
  // }

  return (
    <Box w="full" >
      {showHeader && <Header user={user} />}
      <Box >
        <Routes>
          <Route path="/" element={user ? <HomePage /> : <Navigate to="/auth" />} />
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
          <Route path="/:username" element={<UserPage />} />
          <Route path="/exercise" element={user ? <SurveyPage /> : <Navigate to='/auth' />} />
          <Route path="/test" element={user ? <TestPage /> : <Navigate to='/auth' />} />
          <Route path="/faq" element={user ? <FaqPage /> : <Navigate to='/auth' />} />
        </Routes>
      </Box>

      {user && <AIModal currentUser={user} />}
    </Box>
  );
}

export default App;
