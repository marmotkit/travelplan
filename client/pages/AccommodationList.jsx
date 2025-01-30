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
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { planApi, accommodationApi } from '../services/api';

const STATUS_MAP = {
  pending: { label: '待訂', color: 'default' },
  booked: { label: '已訂', color: 'success' },
  cancelled: { label: '已取消', color: 'error' },
};

const AccommodationList = () => {
  const [items, setItems] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState({
    dateRange: '',
    hotel: '',
    status: 'pending'
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const fetchActivities = async () => {
    try {
      const data = await planApi.getAll();
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('載入活動失敗');
    }
  };

  useEffect(() => {
    if (selectedActivity) {
      loadAccommodations();
    }
  }, [selectedActivity]);

  const loadAccommodations = async () => {
    try {
      const data = await accommodationApi.getByActivity(selectedActivity);
      setItems(data);
    } catch (error) {
      console.error('Error loading accommodations:', error);
      setError('載入住宿資料失敗');
    }
  };

  const handleStatusChange = async (item) => {
    const statusOrder = ['pending', 'booked', 'cancelled'];
    const currentIndex = statusOrder.indexOf(item.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

    try {
      await accommodationApi.updateStatus(item._id, nextStatus);
      await loadAccommodations();
    } catch (error) {
      console.error('Error updating status:', error);
      setError('更新狀態失敗');
    }
  };

  const handleSave = async () => {
    if (!selectedActivity) {
      setError('請先選擇活動');
      return;
    }

    try {
      await accommodationApi.saveItems(selectedActivity, [currentItem]);
      setOpenDialog(false);
      await loadAccommodations();
    } catch (error) {
      console.error('Error saving accommodation:', error);
      setError('儲存失敗');
    }
  };

  const processExcelFile = async (file) => {
    setProcessing(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      const newItems = jsonData.slice(1).map(row => ({
        dateRange: row[0] || '',
        hotel: row[1] || '',
        address: row[2] || '',
        status: row[3] || 'pending'
      }));

      if (selectedActivity) {
        await accommodationApi.saveItems(selectedActivity, newItems);
        await loadAccommodations();
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setError('處理檔案失敗');
    } finally {
      setProcessing(false);
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

  const handleAddItem = () => {
    if (!selectedActivity) {
      setError('請先選擇活動');
      return;
    }
    setCurrentItem({
      dateRange: '',
      hotel: '',
      status: 'pending'
    });
    setOpenDialog(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setEditingId(item._id);
    setEditData(item);
    setOpenDialog(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('確定要刪除這筆住宿資料嗎？')) {
      return;
    }

    try {
      await accommodationApi.deleteItem(itemId);
      await loadAccommodations();
      setError({ type: 'success', message: '刪除成功' });
    } catch (error) {
      console.error('Error deleting accommodation:', error);
      setError({ type: 'error', message: error.response?.data?.message || '刪除失敗' });
    }
  };

  const handleCloseEdit = () => {
    setEditingId(null);
    setOpenDialog(false);
  };

  const handleSaveEdit = async () => {
    try {
      await accommodationApi.updateItem(editingId, editData);
      await loadAccommodations();
      handleCloseEdit();
    } catch (error) {
      console.error('Error updating accommodation:', error);
      setError('更新住宿失敗');
    }
  };

  const handleEditChange = (field, value) => {
    setEditData({
      ...editData,
      [field]: value
    });
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <Box>
      {error && (
        <Alert 
          severity={error.type === 'success' ? 'success' : 'error'} 
          sx={{ mb: 2 }}
          onClose={() => setError('')}
        >
          {error.message}
        </Alert>
      )}
      {processing && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress />
        </Box>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">住宿管理</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Select
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
            sx={{ minWidth: 200 }}
            displayEmpty
          >
            <MenuItem value="">選擇活動</MenuItem>
            {activities.map((activity) => (
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
            disabled={processing || !selectedActivity}
          >
            上傳 Excel
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={(e) => {
                if (e.target.files[0]) {
                  processExcelFile(e.target.files[0]);
                }
              }}
            />
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddItem}
            disabled={!selectedActivity}
          >
            新增項目
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>日期</TableCell>
              <TableCell>住宿</TableCell>
              <TableCell>地址</TableCell>
              <TableCell>訂房狀態</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.dateRange}</TableCell>
                <TableCell>{item.hotel}</TableCell>
                <TableCell>{item.address || '無'}</TableCell>
                <TableCell>
                  <Chip
                    label={STATUS_MAP[item.status].label}
                    color={STATUS_MAP[item.status].color}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleEdit(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(item._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>編輯住宿</DialogTitle>
        <DialogContent>
          <TextField
            label="日期"
            value={currentItem.dateRange || ''}
            onChange={(e) => setCurrentItem({
              ...currentItem,
              dateRange: e.target.value
            })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="住宿"
            value={currentItem.hotel || ''}
            onChange={(e) => setCurrentItem({
              ...currentItem,
              hotel: e.target.value
            })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="地址"
            value={currentItem.address || ''}
            onChange={(e) => setCurrentItem({
              ...currentItem,
              address: e.target.value
            })}
            fullWidth
            margin="normal"
          />
          <Select
            fullWidth
            label="訂房狀態"
            value={currentItem.status}
            onChange={(e) => setCurrentItem({
              ...currentItem,
              status: e.target.value
            })}
          >
            <MenuItem value="pending">待訂</MenuItem>
            <MenuItem value="booked">已訂</MenuItem>
            <MenuItem value="cancelled">已取消</MenuItem>
          </Select>
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

export default AccommodationList; 