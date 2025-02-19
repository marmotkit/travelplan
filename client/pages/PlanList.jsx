import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import planAPI from '../api/plan';
import tripItemAPI from '../api/tripItem';
import accommodationAPI from '../api/accommodation';
import { useAuth } from '../contexts/AuthContext';

const PlanList = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await planAPI.getAll();
      setPlans(response.data || []);
    } catch (err) {
      console.error('獲取行程列表失敗:', err);
      setError('無法載入行程列表');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (plan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!planToDelete) return;

    try {
      setLoading(true);
      await planAPI.delete(planToDelete._id);
      
      // 刪除相關的行程項目和住宿
      await Promise.all([
        tripItemAPI.deleteByPlan(planToDelete._id),
        accommodationAPI.deleteByPlan(planToDelete._id)
      ]);

      await fetchPlans();
      setError('行程已刪除');
    } catch (err) {
      console.error('刪除行程失敗:', err);
      setError('刪除行程失敗');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    }
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setPlanToDelete(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">行程列表</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/plans/new')}
        >
          新增行程
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {plans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {plan.title}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {plan.description}
                </Typography>
                <Box mt={1}>
                  <Chip
                    label={plan.status}
                    color={plan.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </CardContent>
              <CardActions>
                <IconButton
                  size="small"
                  onClick={() => navigate(`/plans/${plan._id}`)}
                  title="查看"
                >
                  <VisibilityIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => navigate(`/plans/${plan._id}/edit`)}
                  title="編輯"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(plan)}
                  title="刪除"
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDialog}
      >
        <DialogTitle>確認刪除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            確定要刪除行程「{planToDelete?.title}」嗎？此操作無法撤銷。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            刪除
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PlanList;