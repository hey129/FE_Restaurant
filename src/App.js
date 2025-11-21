import { BrowserRouter, Routes, Route } from "react-router-dom";
import { publicRoutes, privateRoutes } from "./Routes";
import { DefaultLayout } from "~/Layout";
import { Fragment } from "react";
import { AuthProvider, CartProvider, CustomerProvider, useAuth } from "~/Api";

// Wrapper component to get merchantId from useAuth and pass to CartProvider
function CartProviderWrapper({ children }) {
  const { merchantId } = useAuth();

  return <CartProvider merchantId={merchantId}>{children}</CartProvider>;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {publicRoutes.map((route, index) => {
            let Layout = DefaultLayout;
            if (route.layout === null) {
              Layout = Fragment;
            } else if (route.layout) {
              Layout = route.layout;
            }
            const Page = route.component;
            return (
              <Route
                key={index}
                path={route.path}
                element={
                  <Layout>
                    <Page />
                  </Layout>
                }
              >
                {route.children &&
                  route.children.map((childRoute, childIndex) => {
                    const ChildPage = childRoute.component;
                    return (
                      <Route
                        key={childIndex}
                        path={childRoute.path}
                        element={<ChildPage />}
                      />
                    );
                  })}
              </Route>
            );
          })}

          {/* Private Routes (Restaurant, Admin) */}
          {privateRoutes.map((route, index) => {
            let Layout = DefaultLayout;
            if (route.layout === null) {
              Layout = Fragment;
            } else if (route.layout) {
              Layout = route.layout;
            }
            const Page = route.component;
            return (
              <Route
                key={`private-${index}`}
                path={route.path}
                element={
                  <Layout>
                    <Page />
                  </Layout>
                }
              />
            );
          })}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <CustomerProvider>
      <AuthProvider>
        <CartProviderWrapper>
          <AppRoutes />
        </CartProviderWrapper>
      </AuthProvider>
    </CustomerProvider>
  );
}

export default App;
