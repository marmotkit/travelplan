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
  Divider,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { planApi, budgetApi } from '../services/api';

const STATUS_MAP = {
  pending: { label: '待付款', color: 'default' },
  paid: { label: '已付款', color: 'success' },
  na: { label: 'N/A', color: 'default' },
};

const BudgetList = () => {
  const [budgets, setBudgets] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState({
    type: '固定支出',
    item: '',
    amount: '',
    currency: 'TWD',
    status: 'pending',
    note: ''
  });
  const [summary, setSummary] = useState({
    twdTotal: '',
    thbTotal: '',
    exchangeRate: '',
    finalTotal: '',
    note: ''
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log('開始載入數據...');
      const activitiesRes = await planApi.getAll();
      console.log('活動數據:', activitiesRes.data);

      if (!Array.isArray(activitiesRes.data)) {
        console.error('活動數據格式錯誤:', activitiesRes.data);
        setActivities([]);
        return;
      }

      const validActivities = activitiesRes.data.filter(activity => 
        activity.status === 'planning' || activity.status === 'ongoing'
      );
      console.log('有效活動:', validActivities);
      setActivities(validActivities);
    } catch (error) {
      console.error('載入數據失敗:', error);
      console.error('錯誤詳情:', error.response?.data || error.message);
      setError('載入數據失敗');
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedActivity) {
      loadBudgets();
    } else {
      setBudgets([]);
      setSummary({
        twdTotal: '',
        thbTotal: '',
        exchangeRate: '',
        finalTotal: '',
        note: ''
      });
    }
  }, [selectedActivity]);

  const loadBudgets = async () => {
    try {
      setIsLoading(true);
      console.log('載入活動預算:', selectedActivity);
      const response = await budgetApi.getByActivity(selectedActivity);
      console.log('取得預算資料:', response.data);
      if (!response.data) {
        console.warn('未找到預算數據');
        setBudgets([]);
        setSummary({
          twdTotal: '',
          thbTotal: '',
          exchangeRate: '',
          finalTotal: '',
          note: ''
        });
        return;
      }
      setBudgets(response.data?.items || []);
      setSummary(response.data?.summary || {
        twdTotal: '',
        thbTotal: '',
        exchangeRate: '',
        finalTotal: '',
        note: ''
      });
    } catch (error) {
      console.error('Error loading budgets:', error);
      setError('載入預算資料失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (item) => {
    try {
      const newStatus = item.status === 'pending' ? 'paid' : 'pending';
      await budgetApi.updateStatus(item._id, newStatus);
      await loadBudgets();
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

    if (!currentItem.type) {
      setError('請選擇預算類型');
      return;
    }

    try {
      await budgetApi.saveItems(selectedActivity, [currentItem], summary);
      setOpenDialog(false);
      await loadBudgets();
      setError('儲存成功');
    } catch (error) {
      console.error('Error saving budget:', error);
      setError(error.response?.data?.message || '儲存失敗');
    }
  };

  const generateExampleFile = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['類型', '項目', '金額', '幣別', '狀態', '備註'],
      ['固定支出', '長榮航空機票', '17,871', 'TWD', 'paid', '已支付'],
      ['固定支出', 'Pattaya 住宿', '約 8,478', 'TWD', 'paid', '已支付'],
      ['固定支出', '曼谷住宿', '約 2,423', 'TWD', 'paid', '已支付'],
      ['固定支出', 'Golf 費用', '另計', 'TWD', 'na', ''],
      ['固定支出', '交通（曼谷-芭達雅來回）', '約 500', 'TWD', 'na', ''],
      ['觀光活動', '真理寺門票', '約 500', 'THB', 'pending', '需穿長褲'],
      ['觀光活動', '芭堤雅大象村', '250-700', 'THB', 'pending', '建議網上購買'],
      ['觀光活動', '芭堤雅晚宴遊輪', '約 1,500', 'THB', 'pending', '包含晚餐'],
      ['觀光活動', "Let's Relax Spa", '依選擇', 'THB', 'pending', '60-120 分鐘套餐'],
      ['觀光活動', '喬德夜市預算', '依個人需求', 'THB', 'pending', '推薦火山排骨、巨無霸牛排'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '預算範例');
    XLSX.writeFile(wb, '預算範例.xlsx');
  };

  const processExcelFile = async (file) => {
    setProcessing(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      const newItems = jsonData.map(row => ({
        type: row['類型'] || '固定支出',
        item: row['項目'] || '',
        amount: row['金額'] || '',
        currency: row['幣別'] || 'TWD',
        status: (row['狀態'] || 'pending').toLowerCase(),
        note: row['備註'] || ''
      }));

      if (newItems.length === 0) {
        throw new Error('Excel 檔案中沒有有效的預算項目');
      }

      if (selectedActivity) {
        console.log('Saving items:', newItems);
        const response = await budgetApi.saveItems(selectedActivity, newItems, {
          twdTotal: '',
          thbTotal: '',
          exchangeRate: '',
          finalTotal: '',
          note: ''
        });
        console.log('保存成功:', response.data);
        await loadBudgets();
        setError('上傳成功');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      const errorMessage = error.response?.data?.message || 
        error.message || 
        '處理檔案失敗';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // 計算總費用
  const calculateTotal = (twdTotal, thbTotal, exchangeRate) => {
    try {
      // 清理數字字串，移除非數字字符（保留小數點）
      const cleanNumber = (str) => str.replace(/[^0-9.]/g, '');
      
      // 解析數字
      const twd = parseFloat(cleanNumber(twdTotal)) || 0;
      const thb = parseFloat(cleanNumber(thbTotal)) || 0;
      const rate = parseFloat(cleanNumber(exchangeRate)) || 0;
      
      if (rate === 0) return '';
      
      // 計算總和
      const total = twd + (thb * rate);
      
      // 格式化輸出
      return `約 ${Math.round(total).toLocaleString()} TWD`;
    } catch (error) {
      console.error('Error calculating total:', error);
      return '';
    }
  };

  // 處理總費用變更
  const handleSummaryChange = (field, value) => {
    const newSummary = { ...summary, [field]: value };
    
    // 如果更新的是三個計算欄位之一，就重新計算總和
    if (['twdTotal', 'thbTotal', 'exchangeRate'].includes(field)) {
      newSummary.finalTotal = calculateTotal(
        newSummary.twdTotal,
        newSummary.thbTotal,
        newSummary.exchangeRate
      );
    }
    
    setSummary(newSummary);
  };

  // 儲存總費用
  const handleSaveSummary = async () => {
    if (!selectedActivity) {
      setError('請先選擇活動');
      return;
    }

    try {
      await budgetApi.saveItems(selectedActivity, budgets, summary);
      await loadBudgets();
      setError('總費用儲存成功');
    } catch (error) {
      console.error('Error saving summary:', error);
      setError(error.response?.data?.message || '儲存總費用失敗');
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
        <Typography variant="h4">預算管理</Typography>
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
            onClick={() => setOpenDialog(true)}
            disabled={!selectedActivity}
          >
            新增項目
          </Button>
        </Box>
      </Box>

      <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>
        📌 固定支出
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>項目</TableCell>
              <TableCell>金額</TableCell>
              <TableCell>幣別</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>備註</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {budgets.filter(item => item.type === '固定支出').map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.item}</TableCell>
                <TableCell>{item.amount}</TableCell>
                <TableCell>{item.currency}</TableCell>
                <TableCell>
                  <Chip
                    label={STATUS_MAP[item.status].label}
                    color={STATUS_MAP[item.status].color}
                    onClick={() => handleStatusChange(item)}
                    sx={{ cursor: 'pointer' }}
                  />
                </TableCell>
                <TableCell>{item.note}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => {
                    setCurrentItem(item);
                    setOpenDialog(true);
                  }}>
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

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        🎯 觀光 & 活動費用
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>項目</TableCell>
              <TableCell>金額</TableCell>
              <TableCell>幣別</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>備註</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {budgets.filter(item => item.type === '觀光活動').map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.item}</TableCell>
                <TableCell>{item.amount}</TableCell>
                <TableCell>{item.currency}</TableCell>
                <TableCell>
                  <Chip
                    label={STATUS_MAP[item.status].label}
                    color={STATUS_MAP[item.status].color}
                    onClick={() => handleStatusChange(item)}
                    sx={{ cursor: 'pointer' }}
                  />
                </TableCell>
                <TableCell>{item.note}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => {
                    setCurrentItem(item);
                    setOpenDialog(true);
                  }}>
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

      {selectedActivity && (
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            總費用（不含購物）
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="機票+住宿"
                value={summary.twdTotal}
                onChange={(e) => handleSummaryChange('twdTotal', e.target.value)}
                placeholder="例：28,772 TWD"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="當地消費"
                value={summary.thbTotal}
                onChange={(e) => handleSummaryChange('thbTotal', e.target.value)}
                placeholder="例：約 30,000-35,000 THB"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="匯率"
                value={summary.exchangeRate}
                onChange={(e) => handleSummaryChange('exchangeRate', e.target.value)}
                placeholder="例：1.1"
                helperText="1 THB = ? TWD"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="合計（約台幣換算）"
                value={summary.finalTotal}
                disabled
                placeholder="自動計算"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="備註"
                value={summary.note}
                onChange={(e) => handleSummaryChange('note', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleSaveSummary}
              >
                儲存總費用
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <Box sx={{ p: 3, minWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            {currentItem._id ? '編輯項目' : '新增項目'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Select
                fullWidth
                value={currentItem.type}
                onChange={(e) => setCurrentItem({
                  ...currentItem,
                  type: e.target.value
                })}
              >
                <MenuItem value="固定支出">固定支出</MenuItem>
                <MenuItem value="觀光活動">觀光 & 活動費用</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="項目"
                value={currentItem.item}
                onChange={(e) => setCurrentItem({
                  ...currentItem,
                  item: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="金額"
                value={currentItem.amount}
                onChange={(e) => setCurrentItem({
                  ...currentItem,
                  amount: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <Select
                fullWidth
                value={currentItem.currency}
                onChange={(e) => setCurrentItem({
                  ...currentItem,
                  currency: e.target.value
                })}
              >
                <MenuItem value="TWD">TWD</MenuItem>
                <MenuItem value="THB">THB</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12}>
              <Select
                fullWidth
                value={currentItem.status}
                onChange={(e) => setCurrentItem({
                  ...currentItem,
                  status: e.target.value
                })}
              >
                <MenuItem value="pending">待付款</MenuItem>
                <MenuItem value="paid">已付款</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="備註"
                value={currentItem.note}
                onChange={(e) => setCurrentItem({
                  ...currentItem,
                  note: e.target.value
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

export default BudgetList; 