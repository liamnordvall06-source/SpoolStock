import './App.css';
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";

import DashboardPage from './pages/dashboardPage';
import StockPage from './pages/stockPage';
// import TranscationsPage from './pages/transacationsPage';
import AuthenticationPage from './pages/authenticationPage';

import ProtectedRoute from './routes/ProtectedRoute';
import WithdrawalPage from './pages/withdrawalPage';
import TransactionsPage from './pages/transactionsPage';
import ProductCataloguePage from './pages/productCataloguePage';
import AdminDashboardPage from './pages/adminDashboardPage';
import AdminCustomerPage from './pages/adminCustomerPage';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/stock" 
            element={
              <ProtectedRoute>
                <StockPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/transcations" 
            element={
              <ProtectedRoute>
                <TransactionsPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/withdraw/:productId" 
            element={
              <ProtectedRoute>
                <WithdrawalPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/company/:customerId" 
            element={
              <ProtectedRoute>
                <AdminCustomerPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/catalogue" 
            element={
              <ProtectedRoute>
                <ProductCataloguePage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            } 
          />

          {/* Public routes */}
          <Route path="/auth" element={<AuthenticationPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
