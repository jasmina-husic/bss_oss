
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AppSwitcher from "./components/AppSwitcher";
import { useAuth } from "./contexts/AuthContext";

/* pages */
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CRM from "./pages/CRM";
import CustomerForm from "./pages/CustomerForm";
import CustomerDashboard from "./pages/CustomerDashboard";   // NEW
import Tickets from "./pages/Tickets";
import TicketForm from "./pages/TicketForm";
import CatalogProducts from "./pages/CatalogProducts";
import ProductSpecForm from "./pages/ProductSpecForm";
import ServiceCatalog from "./pages/ServiceCatalog.jsx";
import ServiceSpecForm from "./pages/ServiceSpecForm.jsx";
import RfsCatalog from "./pages/RfsCatalog";
import RfsSpecForm from "./pages/RfsSpecForm";
import CatalogOfferings from "./pages/CatalogOfferings";
import OfferingSpecForm from "./pages/OfferingSpecForm";
import CategoryCatalog from "./pages/CategoryCatalog";
import PriceCatalog from "./pages/PriceCatalog.jsx";
import Orders from "./pages/Orders";
import OrderNew from "./pages/OrderNew";
import OrderForm from "./pages/OrderForm";
import Billing from "./pages/Billing";
import Portal from "./pages/Portal";

/* ─── private route helper ─── */
function PrivateRoute({ roles = [], children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(user.role))
    return <div className="p-6 text-red-600">Not authorised</div>;
  return children;
}

export default function App() {
  return (
    <div className="h-screen flex">
      <AppSwitcher />

      <main className="flex-1 overflow-y-auto bg-white">
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Dashboard */}
          <Route
            path="/"
            element={
              <PrivateRoute roles={["admin", "user"]}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute roles={["admin", "user"]}>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* CRM */}
          <Route
            path="/crm"
            element={
              <PrivateRoute roles={["admin"]}>
                <CRM />
              </PrivateRoute>
            }
          />

          {/* NEW: Customer detailed dashboard */}
          <Route
            path="/crm/:id"
            element={
              <PrivateRoute roles={["admin"]}>
                <CustomerDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/crm/customers/new"
            element={
              <PrivateRoute roles={["admin"]}>
                <CustomerForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/crm/customers/:id"
            element={
              <PrivateRoute roles={["admin"]}>
                <CustomerForm />
              </PrivateRoute>
            }
          />

          {/* Orders */}
          <Route
            path="/orders"
            element={
              <PrivateRoute roles={["admin"]}>
                <Orders />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders/new"
            element={
              <PrivateRoute roles={["admin"]}>
                <OrderNew />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <PrivateRoute roles={["admin"]}>
                <OrderForm />
              </PrivateRoute>
            }
          />

          {/* Ticketing */}
          <Route
            path="/ticketing"
            element={
              <PrivateRoute roles={["admin"]}>
                <Tickets />
              </PrivateRoute>
            }
          />
          <Route
            path="/ticketing/new"
            element={
              <PrivateRoute roles={["admin"]}>
                <TicketForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/ticketing/:id"
            element={
              <PrivateRoute roles={["admin"]}>
                <TicketForm />
              </PrivateRoute>
            }
          />

          {/* Catalog subtree */}
          <Route
            path="/catalog/products"
            element={
              <PrivateRoute roles={["admin"]}>
                <CatalogProducts />
              </PrivateRoute>
            }
          />
          <Route
            path="/catalog/new"
            element={
              <PrivateRoute roles={["admin"]}>
                <ProductSpecForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/catalog/products/:id"
            element={
              <PrivateRoute roles={["admin"]}>
                <ProductSpecForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/catalog/rfs"
            element={
              <PrivateRoute roles={["admin"]}>
                <RfsCatalog />
              </PrivateRoute>
            }
          />
          <Route
            path="/catalog/rfs/new"
            element={
              <PrivateRoute roles={["admin"]}>
                <RfsSpecForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/catalog/rfs/:id"
            element={
              <PrivateRoute roles={["admin"]}>
                <RfsSpecForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/catalog/offerings"
            element={
              <PrivateRoute roles={["admin"]}>
                <CatalogOfferings />
              </PrivateRoute>
            }
          />
          <Route
            path="/catalog/offerings/new"
            element={
              <PrivateRoute roles={["admin"]}>
                <OfferingSpecForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/catalog/offerings/:id"
            element={
              <PrivateRoute roles={["admin"]}>
                <OfferingSpecForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/catalog/services"
            element={
              <PrivateRoute roles={["admin"]}>
                <ServiceCatalog />
              </PrivateRoute>
            }
          />
          <Route
            path="/catalog/services/new"
            element={
              <PrivateRoute roles={["admin"]}>
                <ServiceSpecForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/catalog/services/:id"
            element={
              <PrivateRoute roles={["admin"]}>
                <ServiceSpecForm />
              </PrivateRoute>
            }
          />

          {/* Billing */}
          <Route
            path="/billing"
            element={
              <PrivateRoute roles={["admin"]}>
                <Billing />
              </PrivateRoute>
            }
          />

          {/* Customer portal */}
          <Route
            path="/portal"
            element={
              <PrivateRoute roles={["customer"]}>
                <Portal />
              </PrivateRoute>
            }
          />
          <Route
            path="/catalog/categories"
            element={
              <PrivateRoute roles={["admin"]}>
                <CategoryCatalog />
              </PrivateRoute>
            }
          />
          <Route
            path="/catalog/prices"
            element={
              <PrivateRoute roles={["admin"]}>
                <PriceCatalog />
              </PrivateRoute>
            }
          />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
