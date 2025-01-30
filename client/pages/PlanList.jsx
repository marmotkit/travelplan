import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { 
  planApi, 
  tripItemApi, 
  accommodationApi, 
  budgetApi, 
  travelInfoApi 
} from '../services/api';
import { generateActivityPDF } from '../services/pdfService';

const PlanList = () => {
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      console.log('正在載入活動列表...');
      const response = await planApi.getAll();
      console.log('活動列表載入成功:', response.data);
      setPlans(response.data || []); // 確保 plans 是陣列
    } catch (error) {
      console.error('載入活動列表失敗:', error);
      setError('載入活動列表失敗');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('確定要刪除此活動？')) return;
    
    try {
      await planApi.delete(id);
      await loadPlans();
    } catch (error) {
      setError('刪除活動失敗');
    }
  };

  const handleDownloadPDF = async (planId) => {
    try {
      // 獲取所有需要的數據
      const [
        planRes,
        tripItemsRes,
        accommodationsRes,
        budgetRes,
        travelInfoRes
      ] = await Promise.all([
        planApi.getById(planId),
        tripItemApi.getByActivity(planId),
        accommodationApi.getByActivity(planId),
        budgetApi.getByActivity(planId),
        travelInfoApi.getByActivity(planId)
      ]);

      console.log('Fetched data:', {
        plan: planRes.data,
        tripItems: tripItemsRes.data,
        accommodations: accommodationsRes.data,
        budget: budgetRes.data,
        travelInfo: travelInfoRes.data
      });

      // 生成 PDF
      const pdf = await generateActivityPDF(
        planRes.data,
        tripItemsRes.data || [],
        accommodationsRes.data || [],
        budgetRes.data?.items || [],
        travelInfoRes.data || null
      );

      // 下載 PDF
      await pdf.download(`${planRes.data.title}手冊.pdf`);
      
    } catch (error) {
      console.error('下載 PDF 失敗:', error);
      setError('下載 PDF 失敗');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">活動管理</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/plans/new')}
        >
          新增活動
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>活動名稱</TableCell>
              <TableCell>開始日期</TableCell>
              <TableCell>結束日期</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(plans) && plans.length > 0 ? (
              plans.map((plan) => (
                <TableRow key={plan._id}>
                  <TableCell>{plan.title}</TableCell>
                  <TableCell>
                    {new Date(plan.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(plan.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={plan.status}
                      color={
                        plan.status === '進行中' ? 'primary' :
                        plan.status === '已完成' ? 'success' :
                        'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleDownloadPDF(plan._id)}
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/plans/${plan._id}/edit`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(plan._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  暫無活動資料
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PlanList; 