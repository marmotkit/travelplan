import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UNSAFE_NavigationContext } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import zhTW from 'date-fns/locale/zh-TW';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PlanList from './pages/PlanList';
import PlanDetail from './pages/PlanDetail';
import PlanForm from './pages/PlanForm';
import PlanOverview from './pages/PlanOverview';
import AccommodationList from './pages/AccommodationList';
import BudgetList from './pages/BudgetList';

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
        <Router future={{ 
          v7_relativeSplatPath: true,
          v7_startTransition: true 
        }}>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/plans" element={<PlanList />} />
              <Route path="/plans/overview" element={<PlanOverview />} />
              <Route path="/plans/new" element={<PlanForm />} />
              <Route path="/plans/:id/edit" element={<PlanForm />} />
              <Route path="/plans/:id" element={<PlanDetail />} />
              <Route path="/accommodations" element={<AccommodationList />} />
              <Route path="/budgets" element={<BudgetList />} />
            </Routes>
          </Layout>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App; 