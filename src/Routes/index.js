import Menu from "~/Pages/Customer/Menu";
import ProfilePage from "~/Pages/Customer/Profile";
import CustomerProfile from "~/Pages/Customer/CustomerProfile";
import AllOrders from "~/Pages/Customer/AllOrders";
import RestaurantHome from "~/Pages/Restaurant";
import AdminHome from "~/Pages/Admin";
import Registry from "~/Pages/Customer/Registry";
import Login from "~/Pages/Customer/Login";
import ProductDetail from "~/Pages/Customer/ProductDetail";
import OrderDetail from "~/Pages/Customer/OrderDetail";
import DefaultLayout from "~/Layout/Components/Customer/DefaultLayout";
import Cart from "~/Pages/Customer/Cart";
import CreateOrder from "~/Pages/Customer/CreateOrder";
import PaymentSuccess from "~/Pages/Customer/PaymentSuccess";
import PaymentReturn from "~/Layout/Components/Customer/PaymentReturn";

const publicRoutes = [
  {
    path: "/",
    component: Menu,
    layout: DefaultLayout,
  },

  {
    path: "/product/:id",
    component: ProductDetail,
    layout: DefaultLayout,
  },

  {
    path: "/order/:id",
    component: OrderDetail,
    layout: DefaultLayout,
  },

  {
    path: "/profile",
    component: ProfilePage,
    children: [
      {
        index: true,
        path: "customerprofile",
        component: CustomerProfile,
      },

      {
        path: "order",
        component: AllOrders,
      },
    ],
    layout: DefaultLayout, // Layout chung của toàn trang nếu có
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
  {
    path: "/cart",
    component: Cart,
    layout: DefaultLayout,
  },
  { path: "/createorder", component: CreateOrder, layout: DefaultLayout },
  {
    path: "/payment/success",
    component: PaymentSuccess,
    layout: DefaultLayout,
  },
  {
    path: "/payment/return",
    component: PaymentReturn,
    layout: DefaultLayout,
  },
];

const privateRoutes = [
  { path: "/restaurant", component: RestaurantHome, layout: null },
  { path: "/admin", component: AdminHome, layout: null },
];

export { publicRoutes, privateRoutes };
