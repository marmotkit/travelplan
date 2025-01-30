import { Routes, Route } from 'react-router-dom';
import PlanList from '../pages/PlanList';
import PlanForm from '../pages/PlanForm';
import PlanDetail from '../pages/PlanDetail';
import PlanOverview from '../pages/PlanOverview';

const PlanRoutes = () => {
  return (
    <Routes>
      <Route index element={<PlanList />} />
      <Route path="new" element={<PlanForm />} />
      <Route path=":id" element={<PlanDetail />} />
      <Route path=":id/edit" element={<PlanForm />} />
      <Route path="overview" element={<PlanOverview />} />
    </Routes>
  );
};

export default PlanRoutes; 