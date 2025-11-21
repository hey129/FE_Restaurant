import AdminDashboard from "~/Layout/Components/Admin/AdminDashboard";
import { useAuth } from "~/Api";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Admin() {
  const navigate = useNavigate();

  return <AdminDashboard />;
}

export default Admin;
