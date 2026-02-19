import './App.css';
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";

import DashboardPage from './pages/dashboardPage';
import StockPage from './pages/stockPage';
// import TranscationsPage from './pages/transacationsPage';
import AuthenticationPage from './pages/authenticationPage';

import ProtectedRoute from './routes/ProtectedRoute';
import WithdrawalPage from './pages/withdrawalPage';
import AdminStockPage from './pages/admin/AdminStockPage';
import TransactionsPage from './pages/transactionsPage';


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


          {/* <Route 
            path="/admin/stock" 
            element={
              <ProtectedRoute>
                <AdminStockPage />
              </ProtectedRoute>
            } 
          /> */}


          {/* Public routes */}
          <Route path="/auth" element={<AuthenticationPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
