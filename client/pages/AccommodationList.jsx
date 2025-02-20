import React, { useState, useEffect } from 'react';
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
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { accommodationApi, planApi } from '../services/api';

const STATUS_MAP = {
  pending: { label: '待訂', color: 'default' },
  booked: { label: '已訂', color: 'success' },
  cancelled: { label: '已取消', color: 'error' },
};

// 狀態循環順序
const STATUS_CYCLE = ['pending', 'booked', 'cancelled'];

const getNextStatus = (currentStatus) => {
  const currentIndex = STATUS_CYCLE.indexOf(currentStatus);
  return STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];
};

const AccommodationList = () => {
  const [accommodations, setAccommodations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedActivityForUpload, setSelectedActivityForUpload] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    activityId: '',
    hotel: '',
    address: '',
    dateRange: '',
    status: 'pending'
  });

  useEffect(() => {
    loadData();
  }, [selectedActivity]);

  const loadData = async () => {
    try {
      console.log('正在載入數據...');
      // 先載入活動列表
      const activitiesRes = await planApi.getAll();
      console.log('活動數據:', activitiesRes.data);

      if (!Array.isArray(activitiesRes.data)) {
        console.error('活動數據格式錯誤:', activitiesRes.data);
        throw new Error('活動數據格式錯誤');
      }

      const validActivities = activitiesRes.data.filter(activity => 
        activity.status === 'planning' || activity.status === 'ongoing'
      );
      setActivities(validActivities);

      // 如果選擇了活動，才載入住宿數據
      if (selectedActivity) {
        const accommodationsRes = await accommodationApi.getByActivity(selectedActivity);
        console.log('住宿數據:', accommodationsRes.data);
        setAccommodations(accommodationsRes.data || []);
      } else {
        setAccommodations([]); // 沒有選擇活動時，清空住宿列表
      }
    } catch (error) {
      console.error('載入數據失敗:', error);
      setError('載入數據失敗');
    }
  };

  const handleOpenDialog = (accommodation = null) => {
    if (accommodation) {
      setSelectedAccommodation(accommodation);
      setFormData({
        activityId: typeof accommodation.activityId === 'object' 
          ? accommodation.activityId._id 
          : accommodation.activityId,
        hotel: accommodation.hotel,
        address: accommodation.address,
        dateRange: accommodation.dateRange,
        status: accommodation.status
      });
      console.log('編輯模式 - 活動ID:', typeof accommodation.activityId === 'object' 
        ? accommodation.activityId._id 
        : accommodation.activityId);
    } else {
      setSelectedAccommodation(null);
      setFormData({
        activityId: '',
        hotel: '',
        address: '',
        dateRange: '',
        status: 'pending'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAccommodation(null);
    setFormData({
      activityId: '',
      hotel: '',
      address: '',
      dateRange: '',
      status: 'pending'
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.activityId || !formData.hotel || !formData.address || !formData.dateRange) {
        setError('請填寫所有必填欄位');
        return;
      }

      const submitData = {
        activityId: formData.activityId,
        hotel: formData.hotel,
        address: formData.address,
        dateRange: formData.dateRange,
        status: formData.status || 'pending'
      };

      if (selectedAccommodation) {
        await accommodationApi.update(selectedAccommodation._id, submitData);
      } else {
        await accommodationApi.create(submitData);
      }
      
      console.log('保存成功，重新載入數據');
      await loadData();
      handleCloseDialog();
    } catch (error) {
      console.error('操作失敗:', error);
      setError('操作失敗');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('確定要刪除此住宿資訊？')) return;
    
    try {
      await accommodationApi.delete(id);
      await loadData();
    } catch (error) {
      setError('刪除失敗');
    }
  };

  const getActivityTitle = (activityId) => {
    if (typeof activityId === 'object' && activityId !== null) {
      return activityId.title;
    }
    
    const activity = activities.find(a => a._id === activityId);
    if (!activity) {
      console.warn('找不到活動:', activityId);
      return '未知活動';
    }
    return activity.title;
  };

  const processExcelFile = async (file) => {
    try {
      if (!selectedActivityForUpload) {
        setError('請選擇要上傳到哪個活動');
        return;
      }
      
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (!jsonData || jsonData.length === 0) {
        setError('Excel 檔案沒有資料');
        return;
      }
      
      const newItems = jsonData.map(row => ({
        dateRange: row['日期'] || '',
        hotel: row['住宿'] || '',
        address: row['地址'] || '',
        status: (row['訂房狀態'] || 'pending').toLowerCase()
      }));

      const invalidItems = newItems.filter(item => 
        !item.hotel || !item.address || !item.dateRange
      );
      
      if (invalidItems.length > 0) {
        setError('部分資料缺少必填欄位');
        return;
      }

      console.log('準備上傳的數據:', {
        activityId: selectedActivityForUpload,
        items: newItems
      });

      await accommodationApi.saveItems(selectedActivityForUpload, newItems);
      await loadData();
      setUploadDialog(false);
      setSelectedFile(null);
      setSelectedActivityForUpload('');
    } catch (error) {
      console.error('Error processing file:', error);
      setError(error.response?.data?.message || '處理檔案失敗');
    }
  };

  const generateExampleFile = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['日期', '住宿', '地址', '訂房狀態'],
      ['2/26 - 3/1', 'The Bayview Hotel Pattaya', '310/2 Moo 10 Beach Road, Pattaya', 'booked'],
      ['3/1', '曼谷素坤逸麗亭酒店', '2 North Sathorn Road, Bangrak, Bangkok 10500', 'booked'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '住宿範例');
    XLSX.writeFile(wb, '住宿範例.xlsx');
  };

  const handleStatusChange = async (id, currentStatus) => {
    try {
      const nextStatus = getNextStatus(currentStatus);
      await accommodationApi.patch(`/${id}/status`, { status: nextStatus });
      await loadData();
    } catch (error) {
      console.error('更新狀態失敗:', error);
      setError('更新狀態失敗');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5">住宿管理</Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>選擇活動</InputLabel>
            <Select
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value)}
              label="選擇活動"
              size="small"
            >
              <MenuItem value="">所有活動</MenuItem>
              {activities.map((activity) => (
                <MenuItem key={activity._id} value={activity._id}>
                  {activity.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box>
          <Button
            variant="outlined"
            onClick={generateExampleFile}
            sx={{ mr: 1 }}
          >
            下載範本
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => {
              if (selectedActivity) {
                setSelectedActivityForUpload(selectedActivity);
              }
              setUploadDialog(true);
            }}
            sx={{ mr: 1 }}
          >
            上傳 Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              if (selectedActivity) {
                setFormData(prev => ({ ...prev, activityId: selectedActivity }));
              }
              handleOpenDialog();
            }}
          >
            新增住宿
          </Button>
        </Box>
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
              <TableCell>住宿名稱</TableCell>
              <TableCell>地址</TableCell>
              <TableCell>日期</TableCell>
              <TableCell>訂房狀態</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(accommodations) && accommodations.length > 0 ? (
              accommodations.map((accommodation) => (
                <TableRow key={accommodation._id}>
                  <TableCell>
                    {typeof accommodation.activityId === 'object' 
                      ? accommodation.activityId.title 
                      : getActivityTitle(accommodation.activityId)}
                  </TableCell>
                  <TableCell>{accommodation.hotel}</TableCell>
                  <TableCell>{accommodation.address}</TableCell>
                  <TableCell>{accommodation.dateRange}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        color: theme => STATUS_MAP[accommodation.status].color === 'default' ? 
                          theme.palette.text.primary : 
                          theme.palette[STATUS_MAP[accommodation.status].color].main,
                        borderColor: theme => STATUS_MAP[accommodation.status].color === 'default' ? 
                          theme.palette.grey[300] : 
                          theme.palette[STATUS_MAP[accommodation.status].color].main,
                        '&:hover': {
                          borderColor: theme => STATUS_MAP[accommodation.status].color === 'default' ? 
                            theme.palette.grey[400] : 
                            theme.palette[STATUS_MAP[accommodation.status].color].dark,
                        }
                      }}
                      onClick={() => handleStatusChange(accommodation._id, accommodation.status)}
                    >
                      {STATUS_MAP[accommodation.status].label}
                    </Button>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(accommodation)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(accommodation._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  暫無住宿資料
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedAccommodation ? '編輯住宿' : '新增住宿'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>活動名稱</InputLabel>
              <Select
                value={formData.activityId}
                onChange={(e) => setFormData({ ...formData, activityId: e.target.value })}
                label="活動名稱"
              >
                {Array.isArray(activities) && activities.map((activity) => (
                  <MenuItem key={activity._id} value={activity._id}>
                    {activity.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="住宿名稱"
              value={formData.hotel}
              onChange={(e) => setFormData({ ...formData, hotel: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="地址"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="日期範圍"
              value={formData.dateRange}
              onChange={(e) => setFormData({ ...formData, dateRange: e.target.value })}
              margin="normal"
              placeholder="例如: 2/26 - 3/1"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>訂房狀態</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="訂房狀態"
              >
                {Object.entries(STATUS_MAP).map(([value, { label }]) => (
                  <MenuItem key={value} value={value}>
                    <Chip
                      label={label}
                      size="small"
                      color={STATUS_MAP[value].color}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">
            確定
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)}>
        <DialogTitle>上傳住宿資料</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>選擇活動</InputLabel>
              <Select
                value={selectedActivityForUpload}
                onChange={(e) => setSelectedActivityForUpload(e.target.value)}
                label="選擇活動"
              >
                {activities.map((activity) => (
                  <MenuItem key={activity._id} value={activity._id}>
                    {activity.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <input
              type="file"
              accept=".xlsx"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              id="upload-excel"
            />
            <label htmlFor="upload-excel">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                startIcon={<UploadIcon />}
              >
                選擇檔案
              </Button>
            </label>
            {selectedFile && (
              <Typography sx={{ mt: 1 }}>
                已選擇檔案: {selectedFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>取消</Button>
          <Button
            onClick={() => processExcelFile(selectedFile)}
            variant="contained"
            disabled={!selectedFile || !selectedActivityForUpload}
          >
            上傳
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccommodationList; 