import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { planApi, tripItemApi, accommodationApi, budgetApi } from '../services/api';
import { generateActivityPDF } from '../services/pdfService';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// 模擬數據
const MOCK_DATA = [
  {
    _id: '1',
    title: '日本東京行',
    startDate: '2024-04-01',
    endDate: '2024-04-07',
    status: 'planning',
  },
  {
    _id: '2',
    title: '台東三日遊',
    startDate: '2024-05-15',
    endDate: '2024-05-17',
    status: 'scheduled',
  },
];

const STATUS_MAP = {
  planning: { label: '計劃中', color: 'default' },
  scheduled: { label: '排程中', color: 'primary' },
  ongoing: { label: '進行中', color: 'secondary' },
  completed: { label: '已結案', color: 'success' },
};

const STATUS_OPTIONS = [
  { value: 'planning', label: '計劃中' },
  { value: 'scheduled', label: '排程中' },
  { value: 'ongoing', label: '進行中' },
  { value: 'completed', label: '已結案' },
];

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-TW');
};

export default function PlanList() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await planApi.getAll();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleStatusChange = async (plan) => {
    if (updating) return; // 防止重複點擊
    setUpdating(true);
    const currentIndex = STATUS_OPTIONS.findIndex(s => s.value === plan.status);
    const nextIndex = (currentIndex + 1) % STATUS_OPTIONS.length;
    const newStatus = STATUS_OPTIONS[nextIndex].value;
    
    try {
      await planApi.update(plan._id, { status: newStatus });
      await fetchPlans();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    // TODO: 加入API呼叫來刪除數據
    try {
      await planApi.delete(id);
      await fetchPlans();  // 重新獲取列表
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const handleExportPDF = async (activity) => {
    try {
      setError(null);
      console.log('Fetching data for activity:', activity._id);
      const [tripItems, accommodations, budgets, travelInfo] = await Promise.all([
        tripItemApi.getByActivity(activity._id).then(res => {
          console.log('Trip items:', res);
          return res || [];
        }),
        accommodationApi.getByActivity(activity._id).then(res => {
          console.log('Accommodations:', res);
          return res || [];
        }),
        budgetApi.getByActivity(activity._id).then(res => {
          console.log('Budgets:', res);
          return res?.items || [];
        }),
        axios.get(`${API_URL}/travel-info/activity/${activity._id}`).then(res => res.data)
      ]);

      // 檢查並轉換數據格式
      const formattedTripItems = Array.isArray(tripItems) ? tripItems : [];
      const formattedAccommodations = Array.isArray(accommodations) ? accommodations : [];
      const formattedBudgets = Array.isArray(budgets) ? budgets : [];
      
      console.log('Formatted data:', {
        tripItems: formattedTripItems,
        accommodations: formattedAccommodations,
        budgets: formattedBudgets,
        travelInfo
      });

      // 生成 PDF
      const pdf = await generateActivityPDF(
        activity,
        formattedTripItems,
        formattedAccommodations,
        formattedBudgets,
        travelInfo
      );

      // 下載 PDF
      try {
        await pdf.download(`${activity.title}_活動手冊.pdf`);
      } catch (error) {
        console.error('Error downloading PDF:', error);
        setError('下載 PDF 失敗');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setError('匯出 PDF 失敗：' + (error.message || '未知錯誤'));
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          活動管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/plans/new')}
        >
          新增活動
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>活動標題</TableCell>
              <TableCell>開始日期</TableCell>
              <TableCell>結束日期</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan._id}>
                <TableCell>{plan.title}</TableCell>
                <TableCell>{formatDate(plan.startDate)}</TableCell>
                <TableCell>{formatDate(plan.endDate)}</TableCell>
                <TableCell>
                  <Chip
                    label={STATUS_MAP[plan.status].label}
                    color={STATUS_MAP[plan.status].color}
                    size="small"
                    onClick={() => handleStatusChange(plan)}
                    sx={{ cursor: 'pointer' }}
                    disabled={updating}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => navigate(`/plans/${plan._id}/edit`)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(plan._id)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton onClick={() => handleExportPDF(plan)}>
                    <DownloadIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 