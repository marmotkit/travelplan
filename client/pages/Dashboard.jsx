import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTrips: 0,
    upcomingTrips: 0,
    totalBudget: 0,
    totalExpenses: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    preferences: ''
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`${API_URL}/dashboard/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('獲取儀表板數據失敗:', err);
      setError('無法載入儀表板數據');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setProfileData({
      username: user.username,
      email: user.email,
      preferences: user.preferences || ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveProfile = async () => {
    try {
      await api.put(`${API_URL}/users/profile`, profileData);
      handleCloseDialog();
      // 重新獲取用戶數據
      fetchDashboardData();
    } catch (err) {
      console.error('更新個人資料失敗:', err);
      setError('更新個人資料失敗');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
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
      <Box mb={4}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h4">
                歡迎回來，{user?.username}
              </Typography>
              <IconButton onClick={handleEditProfile} color="primary">
                <EditIcon />
              </IconButton>
            </Box>
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            </Grid>
          )}

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  總行程數
                </Typography>
                <Typography variant="h5">
                  {stats.totalTrips}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  即將出發
                </Typography>
                <Typography variant="h5">
                  {stats.upcomingTrips}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  總預算
                </Typography>
                <Typography variant="h5">
                  ${stats.totalBudget.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  總支出
                </Typography>
                <Typography variant="h5">
                  ${stats.totalExpenses.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>編輯個人資料</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="用戶名"
            name="username"
            value={profileData.username}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="郵箱"
            name="email"
            type="email"
            value={profileData.email}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="偏好設置"
            name="preferences"
            multiline
            rows={4}
            value={profileData.preferences}
            onChange={handleInputChange}
            placeholder="輸入您的旅行偏好，例如：喜歡的住宿類型、飲食習慣等"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSaveProfile} variant="contained" color="primary">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;