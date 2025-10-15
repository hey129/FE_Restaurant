import { BrowserRouter, Routes, Route } from "react-router-dom";
import { publicRoutes } from "./Routes";
import { DefaultLayout } from "~/Layout";
import { Fragment } from "react";
import { AuthProvider, CartProvider, CustomerProvider } from "~/Api";

function App() {
  return (
    <CustomerProvider>
      <AuthProvider>
        <CartProvider>
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
                    />
                  );
                })}
              </Routes>
            </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </CustomerProvider>
  );
}

export default App;
