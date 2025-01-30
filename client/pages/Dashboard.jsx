import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList
} from 'recharts';
import { Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import { api } from '../services/api';

const API_URL = 'http://localhost:5000/api';

// 圓餅圖顏色
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [travelInfo, setTravelInfo] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingType, setEditingType] = useState(''); // 'expenses' 或 'notices'
  const [editingData, setEditingData] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/yearly-stats');
      console.log('Received stats:', response.data);
      const statsArray = [{
        year: new Date().getFullYear(),
        activityCount: response.data.totalActivities,
        plannedCount: response.data.plannedActivities,
        ongoingCount: response.data.ongoingActivities,
        completedCount: response.data.completedActivities,
        totalBudget: response.data.totalBudget
      }];
      setStats(statsArray);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('載入統計資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/plans');
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('無法載入活動數據');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchStats(),
          fetchActivities()
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // 格式化圓餅圖數據
  const pieData = stats.filter(item => item.activityCount > 0).map(item => ({
    name: `${item.year}年`,
    value: item.activityCount
  }));

  // 載入旅遊資訊
  const loadTravelInfo = async (activityId) => {
    try {
      const response = await api.get(`/travel-info/activity/${activityId}`);
      setTravelInfo(response.data);
    } catch (error) {
      console.error('Error loading travel info:', error);
      setError('載入旅遊資訊失敗');
    }
  };

  // 處理活動選擇
  const handleActivityChange = (event) => {
    const activityId = event.target.value;
    setSelectedActivity(activityId);
    if (activityId) {
      loadTravelInfo(activityId);
    } else {
      setTravelInfo(null);
    }
  };

  // 處理編輯
  const handleEdit = (type) => {
    setEditingType(type);
    setEditingData(type === 'expenses' ? travelInfo.expenses : travelInfo.notices);
    setOpenDialog(true);
  };

  // 處理儲存
  const handleSave = async () => {
    try {
      const updatedInfo = {
        ...travelInfo,
        [editingType]: editingData
      };
      
      await api.put(
        `/travel-info/activity/${selectedActivity}`,
        updatedInfo
      );
      
      setTravelInfo(updatedInfo);
      setOpenDialog(false);
      setError('儲存成功');
    } catch (error) {
      console.error('Error saving travel info:', error);
      setError('儲存失敗');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          儀表板
        </Typography>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <Alert severity="info">
            目前沒有統計數據
          </Alert>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        儀表板
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 活動數量統計 - 圓餅圖 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              年度活動數量統計
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.value}個`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* 支出統計 - 柱狀圖 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              年度活動支出統計 (TWD)
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={stats}
                margin={{
                  top: 40,    // 增加頂部空間
                  right: 30,
                  left: 20,
                  bottom: 5
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="year"
                  axisLine={true}
                  tickLine={true}
                />
                <YAxis
                  axisLine={true}
                  tickLine={true}
                  domain={[0, 'auto']}  // 自動調整最大值
                />
                <Tooltip formatter={(value) => `${value.toLocaleString()} TWD`} />
                <Legend />
                <Bar dataKey="totalBudget" name="總支出" fill="#82ca9d">
                  <LabelList 
                    dataKey="totalBudget" 
                    position="inside"
                    fill="#fff"
                    formatter={(value) => `${(value/1000).toFixed(0)}K`}
                    style={{
                      textShadow: '0 0 3px #000'
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Typography variant="h6">
              選擇活動：
            </Typography>
          </Grid>
          <Grid item xs>
            <Select
              fullWidth
              value={selectedActivity}
              onChange={handleActivityChange}
              displayEmpty
            >
              <MenuItem value="">請選擇活動</MenuItem>
              {activities?.map((activity) => (
                <MenuItem key={activity._id} value={activity._id}>
                  {activity.title}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>
      </Box>

      {selectedActivity && travelInfo && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* 需要攜帶的費用 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  🎒 需要攜帶的費用
                </Typography>
                <IconButton onClick={() => handleEdit('expenses')}>
                  <EditIcon />
                </IconButton>
              </Box>
              <List>
                <ListItem>
                  <ListItemIcon>💵</ListItemIcon>
                  <ListItemText
                    primary="現金"
                    secondary={travelInfo.expenses?.cash?.note || ''}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>💳</ListItemIcon>
                  <ListItemText
                    primary="信用卡"
                    secondary={
                      travelInfo.expenses?.creditCard?.recommendations?.join('\n')
                    }
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* 注意事項 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  📌 注意事項
                </Typography>
                <IconButton onClick={() => handleEdit('notices')}>
                  <EditIcon />
                </IconButton>
              </Box>
              <Typography variant="body1" whiteSpace="pre-line">
                {travelInfo.notices || ''}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* 編輯對話框 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingType === 'expenses' ? '編輯費用建議' : '編輯注意事項'}
        </DialogTitle>
        <DialogContent>
          {editingType === 'expenses' ? (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="現金備註"
                  value={editingData?.cash?.note || ''}
                  onChange={(e) => setEditingData({
                    ...editingData,
                    cash: {
                      ...editingData?.cash,
                      note: e.target.value
                    }
                  })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="信用卡建議"
                  value={editingData?.creditCard?.recommendations?.join('\n') || ''}
                  onChange={(e) => setEditingData({
                    ...editingData,
                    creditCard: {
                      recommendations: e.target.value.split('\n')
                    }
                  })}
                  helperText="每行一個建議"
                />
              </Grid>
            </Grid>
          ) : (
            <TextField
              fullWidth
              multiline
              rows={6}
              label="注意事項"
              value={editingData || ''}
              onChange={(e) => setEditingData(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>取消</Button>
          <Button variant="contained" onClick={handleSave}>
            儲存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard; 