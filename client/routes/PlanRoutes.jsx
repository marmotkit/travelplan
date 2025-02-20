import { Routes, Route } from 'react-router-dom';
import PlanList from '../pages/PlanList';
import PlanForm from '../pages/PlanForm';
import PlanDetail from '../pages/PlanDetail';
import PlanOverview from '../pages/PlanOverview';
import ItineraryManagement from '../pages/ItineraryManagement';

const PlanRoutes = () => {
  return (
    <Routes>
      <Route index element={<PlanOverview />} />
      <Route path="new" element={<PlanForm />} />
      <Route path=":id" element={<PlanDetail />} />
      <Route path=":id/edit" element={<PlanForm />} />
      <Route path="overview" element={<PlanOverview />} />
      <Route path=":planId/itinerary" element={<ItineraryManagement />} />
    </Routes>
  );
};

export default PlanRoutes; 