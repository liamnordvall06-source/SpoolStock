import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import DashboardPage from './pages/dashboardPage';
import StockPage from './pages/stockPage';
import TranscationsPage from './pages/transacationsPage';
import AdminPage from './pages/adminPage';
import AuthenticationPage from './pages/authenticationPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/transcations" element={<TranscationsPage />} />
          <Route path="/admin" element={<AdminPage />}/>
          <Route path="/auth" element={<AuthenticationPage />}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
