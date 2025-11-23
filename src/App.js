import { BrowserRouter, Routes, Route } from "react-router-dom";
import { publicRoutes, privateRoutes } from "./Routes";
import { DefaultLayout } from "~/Layout";
import { Fragment } from "react";
import { AuthProvider, CartProvider, CustomerProvider } from "~/Api";

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
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </CustomerProvider>
  );
}

export default App;
