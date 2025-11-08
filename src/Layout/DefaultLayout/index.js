import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { Toaster } from "react-hot-toast";

function DefaultLayout({ children }) {
  return (
    <div>
      <Header />
      <div className="container">
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 3000,
            style: { zIndex: 999999 },
          }}
        />
        <div className="content">{children}</div>
      </div>
      <Footer />
    </div>
  );
}

export default DefaultLayout;
