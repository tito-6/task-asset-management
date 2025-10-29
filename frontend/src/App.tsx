import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute.js";
import DashboardLayout from "./layouts/DashboardLayout.js";
import DashboardLayout2 from "./layouts/DashboardLayout2.js";
import AssetsPage from "./pages/AssetsPage.js";
import LoginPage from "./pages/LoginPage.js";
import TasksPage from "./pages/TasksPage.js";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout2 />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="assets" replace />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="tasks" element={<TasksPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
