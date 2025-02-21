import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import zhTW from 'date-fns/locale/zh-TW';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PlanRoutes from './routes/PlanRoutes';
import AccommodationList from './pages/AccommodationList';
import BudgetList from './pages/BudgetList';
import UserManagement from './pages/UserManagement';
import ErrorBoundary from './components/ErrorBoundary';
import PlanList from './pages/PlanList';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
          <CssBaseline />
          <Router>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="plans/*" element={<PlanRoutes />} />
                <Route path="activities" element={<PlanList />} />
                <Route path="accommodations" element={<AccommodationList />} />
                <Route path="budgets" element={<BudgetList />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </LocalizationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;