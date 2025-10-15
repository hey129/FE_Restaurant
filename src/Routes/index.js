// src/routes/index.js
import Menu from "~/Pages/Customer/Menu";
import CustomerProfile from "~/Pages/Customer/Profile";
import RestaurantHome from "~/Pages/Restaurant";
import AdminHome from "~/Pages/Admin";
import Registry from "~/Pages/Customer/Registry";
import Login from "~/Pages/Customer/Login";
import ProductDetail from "~/Pages/Customer/ProductDetail"; // ⬅️ thêm import
import DefaultLayout from "~/Layout/DefaultLayout";

const publicRoutes = [
  {
    path: "/",
    component: Menu,
    layout: DefaultLayout,
  },
  {
    path: "/menu",
    component: Menu,
    layout: DefaultLayout,
  },
  {
    path: "/product/:id",
    component: ProductDetail,
    layout: DefaultLayout,
  },
  {
    path: "/profile",
    component: CustomerProfile,
    layout: DefaultLayout,
  },
  {
    path: "/registry",
    component: Registry,
    layout: DefaultLayout,
  },
  {
    path: "/login",
    component: Login,
    layout: DefaultLayout,
  },
];

const privateRoutes = [
  { path: "/restaurant", component: RestaurantHome },
  { path: "/admin", component: AdminHome },
];

export { publicRoutes, privateRoutes };
