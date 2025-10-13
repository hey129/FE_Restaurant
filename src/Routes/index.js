import Menu from "~/Pages/Customer/Menu";
import CustomerProfile from "~/Pages/Customer/Profile";
import RestaurantHome from "~/Pages/Restaurant";
import AdminHome from "~/Pages/Admin";
import Registry from "~/Pages/Customer/Registry";
import Login from "~/Pages/Customer/Login";
import { DefaultLayout } from "~/Layout";

const publicRoutes = [
  {
    path: "/",
    component: Menu,
    layout: DefaultLayout,
  },
  {
    path: "/Profile",
    component: CustomerProfile,
  },

  {
    path: "/Registry",
    component: Registry,
    layout: DefaultLayout,
  },

  {
    path: "/Login",
    component: Login,
    layout: DefaultLayout,
  },
];
const privateRoutes = [
  {
    path: "/restaurant",
    component: RestaurantHome,
  },
  {
    path: "/admin",
    component: AdminHome,
  },
];

export { publicRoutes, privateRoutes };
