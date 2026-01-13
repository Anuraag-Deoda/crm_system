import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LiveCalls from './pages/LiveCalls';
import DemoCall from './pages/DemoCall';
import Customers from './pages/Customers';
import Appointments from './pages/Appointments';
import Complaints from './pages/Complaints';
import Leads from './pages/Leads';
import Vehicles from './pages/Vehicles';
import CallLogs from './pages/CallLogs';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="live-calls" element={<LiveCalls />} />
          <Route path="demo" element={<DemoCall />} />
          <Route path="customers" element={<Customers />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="leads" element={<Leads />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="call-logs" element={<CallLogs />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
