import { Route, Routes } from "react-router";
import { useNavigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import { useEffect } from "react";
import { AuthProvider } from "./AuthProvider";
import { useAuth } from "./AuthProvider";
import { routes } from "./Routes";

const BackButtonHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handlePopState = () => {
      console.log('Back button pressed!');
      navigate(-1);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  return null;
};

const NavBarWrapper = () => {
  const { isAuthenticated } = useAuth();
  return <NavBar state={isAuthenticated} />;
};

const AppInner = () => {
  return (
    <>
      <BackButtonHandler />
      <NavBarWrapper />
      <Routes>
        {routes.map((route, index) => {
          const Page = route.page
          return (
            <Route key={index} path={route.path} element={<Page />} />
          );
        })}
      </Routes>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App