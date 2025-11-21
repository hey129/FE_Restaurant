import { useNavigate } from "react-router-dom";
import { useAuth } from "~/Api";
import MerchantLogin from "~/Layout/Components/Restaurant/MerchantLogin";
import RestaurantDashboard from "~/Layout/Components/Restaurant/Dashboard";

function Restaurant() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, user, isMerchant } = useAuth();

  // Show loading
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated or not a merchant
  if (!isAuthenticated || !isMerchant) {
    return <MerchantLogin />;
  }

  // Show merchant dashboard with all features
  return <RestaurantDashboard />;
}

export default Restaurant;
