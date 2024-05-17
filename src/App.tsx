import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AssetsTable } from './pages/AssetsTable';
import { Login } from './pages/Login';

export const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/assets" element={<AssetsTable />} />
        </Routes>
      </div>
    </Router>
  );
};
