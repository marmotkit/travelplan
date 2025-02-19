import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
// 其他導入...

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* 其他路由... */}
      </Routes>
    </Router>
  );
}

export default App; 