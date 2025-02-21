import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
  typography: {
    fontFamily: [
      'Noto Sans TC',
      'sans-serif'
    ].join(','),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
        <ErrorBoundary>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="activities" element={<PlanList />} />
                <Route path="plans/*" element={<PlanRoutes />} />
                <Route path="accommodations" element={<AccommodationList />} />
                <Route path="budgets" element={<BudgetList />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ErrorBoundary>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;