import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  ThemeProvider,
  createTheme,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import planAPI from '../api/plan';
import tripItemAPI from '../api/tripItem';

const processExcelData = (data) => {
  let currentDate = '';
  let activities = [];

  // 跳過標題行，處理數據
  const rows = data.slice(1).reduce((acc, row) => {
    if (row[0]) {  // 如果有日期
      if (activities.length > 0) {  // 保存之前的活動
        acc.push({
          date: currentDate,
          activities: activities.map(a => ({
            ...a,
            activity: a.activity || '',  // 確保有值
            cost: a.cost || ''          // 確保有值
          })),
          rowSpan: activities.length
        });
      }
      currentDate = row[0];
      activities = [{
        activity: row[1] || '',
        cost: row[2] || '',
        id: Date.now() + Math.random()
      }];
    } else if (row[1] || row[2]) {  // 只有活動或費用
      activities.push({
        activity: row[1] || '',
        cost: row[2] || '',
        id: Date.now() + Math.random()
      });
    }
    return acc;
  }, []);

  // 添加最後一組數據
  if (activities.length > 0) {
    rows.push({
      date: currentDate,
      activities: activities.map(a => ({
        ...a,
        activity: a.activity || '',  // 確保有值
        cost: a.cost || ''          // 確保有值
      })),
      rowSpan: activities.length
    });
  }

  // 驗證資料
  const validRows = rows.filter(row => 
    row.date && 
    Array.isArray(row.activities) && 
    row.activities.length > 0
  );

  if (validRows.length === 0) {
    throw new Error('沒有有效的行程資料');
  }

  return validRows;
};

const generateExampleFile = () => {
  const ws = XLSX.utils.aoa_to_sheet([
    ['日期', '活動', '費用預估（TWD/THB）'],
    ['2/26（Day 1）曼谷 & 芭達雅', '台北 → 曼谷（BR67）\nTopGolf 體驗\n移動至 Pattaya 飯店\n芭達雅夜市觀光', '機票 17,871 TWD（已支付）\n曼谷→芭達雅交通：約500 THB/人'],
    ['2/27（Day 2）芭達雅', 'Siam Country Club Waterside（Tee Off 7:40）\n觀光：真理寺、大象村\n芭達雅晚宴遊輪', 'Golf Green Fee：約4,500 THB\n真理寺門票：500 THB\n大象村：250-700 THB\n晚宴遊輪：約1,500 THB'],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '行程範例');
  XLSX.writeFile(wb, '行程範例.xlsx');
};

// 定義交替的背景色
const alternateColors = {
  even: '#f8f9fa',  // 淺灰色
  odd: '#ffffff'    // 白色
};

const PlanOverview = () => {
  const [items, setItems] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [currentItem, setCurrentItem] = useState({
    date: '',
    activity: '',
    cost: '',
  });
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedActivity) {
      loadTripItems();
    }
  }, [selectedActivity]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log('開始載入數據...');
      const activitiesRes = await planAPI.getAll();
      console.log('活動數據:', activitiesRes.data);

      // 確保 activities 是陣列
      if (!Array.isArray(activitiesRes.data)) {
        console.error('活動數據格式錯誤:', activitiesRes.data);
        setActivities([]);
        return;
      }

      // 只取進行中和計劃中的活動
      const validActivities = activitiesRes.data.filter(activity => 
        activity.status === 'planning' || activity.status === 'ongoing'
      );
      console.log('有效活動:', validActivities);
      setActivities(validActivities);
    } catch (error) {
      console.error('載入數據失敗:', error);
      console.error('錯誤詳情:', error.response?.data || error.message);
      setError('載入數據失敗');
      setActivities([]); // 確保設置空陣列
    } finally {
      setIsLoading(false);
    }
  };

  const loadTripItems = async () => {
    try {
      const response = await tripItemAPI.getByActivity(selectedActivity);
      console.log('載入行程項目數據:', response.data);

      // 確保數據是陣列
      const tripData = Array.isArray(response.data) ? response.data : [];
      
      // 將資料轉換為顯示格式
      const groupedItems = groupTripItems(tripData);
      setItems(groupedItems);
    } catch (error) {
      console.error('載入行程項目失敗:', error);
      setError('載入行程項目失敗');
      setItems([]); // 確保設置空陣列
    }
  };

  const groupTripItems = (data) => {
    if (!Array.isArray(data)) {
      console.warn('groupTripItems 收到非陣列數據:', data);
      return [];
    }

    const grouped = {};
    data.forEach(item => {
      if (!grouped[item.date]) {
        grouped[item.date] = {
          date: item.date,
          activities: []
        };
      }
      grouped[item.date].activities.push({
        id: item._id,
        activity: item.activity,
        cost: item.cost
      });
    });

    // 轉換為陣列並加入 rowSpan
    return Object.values(grouped).map(group => ({
      ...group,
      rowSpan: group.activities.length
    }));
  };

  const handleSaveAll = async () => {
    if (!selectedActivity) {
      setError('請先選擇活動');
      return;
    }
    setSaving(true);
    try {
      // 轉換數據格式
      const formattedItems = items.map(dateGroup => ({
        date: dateGroup.date,
        activities: dateGroup.activities.map(activity => ({
          activity: activity.activity,
          cost: activity.cost
        }))
      }));

      console.log('Saving items:', {
        activityId: selectedActivity,
        items: formattedItems
      });

      await tripItemAPI.saveItems(selectedActivity, formattedItems);
      setError('儲存成功');
    } catch (error) {
      console.error('Error saving trip items:', {
        error,
        response: error.response?.data,
        items: formattedItems
      });
      setError(`儲存失敗: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = () => {
    setCurrentItem({
      date: '',
      activity: '',
      cost: '',
    });
    setOpenDialog(true);
  };

  const handleSave = () => {
    if (currentItem.id) {
      setItems(items.map(item => 
        item.id === currentItem.id ? currentItem : item
      ));
    } else {
      setItems([...items, { ...currentItem, id: Date.now() }]);
    }
    setOpenDialog(false);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setOpenDialog(true);
  };

  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const processExcelFile = async (file) => {
    setProcessing(true);
    setError('');
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      const newItems = processExcelData(jsonData);
      setItems(prev => [...prev, ...newItems]);
    } catch (err) {
      console.error('Excel processing error:', err);
      setError('Excel 檔案處理失敗，請確認格式是否正確');
    } finally {
      setProcessing(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      await processExcelFile(file);
    }
  };

  return (
    <Box>
      {error && (
        <Alert 
          severity={error.includes('成功') ? 'success' : 'error'} 
          sx={{ mb: 2 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}
      {processing && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress />
        </Box>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">行程管理</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Select
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
            sx={{ minWidth: 200 }}
            displayEmpty
          >
            <MenuItem value="">選擇活動</MenuItem>
            {Array.isArray(activities) && activities.map((activity) => (
              <MenuItem key={activity._id} value={activity._id}>
                {activity.title}
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="outlined"
            onClick={generateExampleFile}
          >
            下載範例
          </Button>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            component="label"
            disabled={processing}
          >
            上傳 Excel
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
            />
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddItem}
          >
            新增項目
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveAll}
            disabled={saving || !selectedActivity || items.length === 0}
          >
            {saving ? '儲存中...' : '儲存行程'}
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>日期</TableCell>
              <TableCell>活動</TableCell>
              <TableCell>費用預估</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((dateGroup, groupIndex) => (
              dateGroup.activities.map((activity, index) => (
                <TableRow 
                  key={activity.id}
                  sx={{
                    backgroundColor: groupIndex % 2 === 0 
                      ? alternateColors.even 
                      : alternateColors.odd
                  }}
                >
                  {index === 0 && (
                    <TableCell
                      rowSpan={dateGroup.rowSpan}
                      sx={{ 
                        verticalAlign: 'middle',
                        borderRight: '1px solid rgba(224, 224, 224, 1)',
                        backgroundColor: groupIndex % 2 === 0 
                          ? alternateColors.even 
                          : alternateColors.odd
                      }}
                    >
                      {dateGroup.date}
                    </TableCell>
                  )}
                  <TableCell>{activity.activity}</TableCell>
                  <TableCell>{activity.cost}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit({
                        id: activity.id,
                        date: dateGroup.date,
                        activity: activity.activity,
                        cost: activity.cost
                      })}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(activity.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <Box sx={{ p: 3, minWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            {currentItem.id ? '編輯項目' : '新增項目'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="日期"
                value={currentItem.date}
                onChange={(e) => setCurrentItem({
                  ...currentItem,
                  date: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="活動"
                value={currentItem.activity}
                onChange={(e) => setCurrentItem({
                  ...currentItem,
                  activity: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="費用預估"
                value={currentItem.cost}
                onChange={(e) => setCurrentItem({
                  ...currentItem,
                  cost: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => setOpenDialog(false)}>取消</Button>
              <Button variant="contained" onClick={handleSave}>
                儲存
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Dialog>
    </Box>
  );
};

export default PlanOverview; 