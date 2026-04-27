import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Layout & Core
import MainLayout from "../components/layout/MainLayout";
import DashboardPage from "../pages/DashboardPage";
import SettingsPage from "../pages/SettingsPage";

// Inventory Feature
import InventoryPage from "../pages/inventory/InventoryPage";
import AddProductPage from "../pages/inventory/AddProductPage";

// Order Feature (Updated to use modular Workstation)
import OrdersPage from "../pages/order/OrdersPage";
import OrderWorkstation from "../pages/order/OrderWorkstation/OrderWorkstation";

// Customer Feature
import CustomersPage from "../pages/customer/CustomerPage";
import AddCustomerPage from "../pages/customer/AddCustomerPage";

// User Feature
import UsersPage from "../pages/user/UsersPage";
import AddUserPage from "../pages/user/AddUserPage";

const AppRouter = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <MainLayout />,
      children: [
        // 1. Dashboard (The Landing Page)
        { index: true, element: <DashboardPage /> },

        // 2. Inventory Management
        {
          path: "inventory",
          children: [
            { index: true, element: <InventoryPage /> },
            { path: "add", element: <AddProductPage /> },
            { path: "edit/:id", element: <AddProductPage /> },
          ],
        },

        // 3. Order Management (The Workstation)
        {
          path: "orders",
          children: [
            { index: true, element: <OrdersPage /> },
            { path: "add", element: <OrderWorkstation /> },
            { path: "edit/:id", element: <OrderWorkstation /> },
            { path: "view/:id", element: <OrderWorkstation /> },
          ],
        },

        // 4. Customer CRM
        {
          path: "customers",
          children: [
            { index: true, element: <CustomersPage /> },
            { path: "add", element: <AddCustomerPage /> },
            { path: "edit/:id", element: <AddCustomerPage /> },
          ],
        },

        // 5. User Management & Admin
        {
          path: "users",
          children: [
            { index: true, element: <UsersPage /> },
            { path: "add", element: <AddUserPage /> },
          ],
        },

        // 6. App Settings
        { path: "settings", element: <SettingsPage /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default AppRouter;
