import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

const ITEM_TYPES = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  activity: '主行程',
  accommodation: '住宿',
  other: '其他'
};

const ItineraryManagement = () => {
  const { planId } = useParams();
  const [itinerary, setItinerary] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    type: 'activity',
    title: '',
    time: '',
    location: '',
    notes: '',
    cost: {
      amount: '',
      currency: 'TWD'
    }
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadItinerary();
  }, [planId]);

  const loadItinerary = async () => {
    try {
      const response = await api.get(`/itinerary/plan/${planId}`);
      setItinerary(response.data);
    } catch (error) {
      setError('載入行程失敗');
    }
  };

  const handleAddItem = () => {
    setSelectedItem(null);
    setFormData({
      type: 'activity',
      title: '',
      time: '',
      location: '',
      notes: '',
      cost: {
        amount: '',
        currency: 'TWD'
      }
    });
    setOpenDialog(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setFormData({
      type: item.type,
      title: item.title,
      time: item.time,
      location: item.location,
      notes: item.notes,
      cost: item.cost
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (selectedItem) {
        await api.put(`/itinerary/${selectedItem._id}/item/${selectedItem.itemId}`, formData);
      } else {
        await api.post('/itinerary', {
          planId,
          date: selectedDate,
          items: [formData]
        });
      }
      await loadItinerary();
      setOpenDialog(false);
    } catch (error) {
      setError('儲存失敗');
    }
  };

  const handleDelete = async (id, itemId) => {
    if (!window.confirm('確定要刪除此項目？')) return;
    
    try {
      await api.delete(`/itinerary/${id}/item/${itemId}`);
      await loadItinerary();
    } catch (error) {
      setError('刪除失敗');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        行程管理
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {itinerary.map((dayItinerary) => (
          <Grid item xs={12} key={dayItinerary._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    {format(new Date(dayItinerary.date), 'yyyy/MM/dd (eee)', { locale: zhTW })}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setSelectedDate(dayItinerary.date);
                      handleAddItem();
                    }}
                  >
                    新增項目
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  {dayItinerary.items.map((item) => (
                    <Grid item xs={12} md={6} key={item._id}>
                      <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle1" color="primary">
                            {ITEM_TYPES[item.type]}
                          </Typography>
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() => handleEditItem(item)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(dayItinerary._id, item._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                        
                        <Typography variant="h6">{item.title}</Typography>
                        {item.time && (
                          <Typography variant="body2" color="text.secondary">
                            時間：{item.time}
                          </Typography>
                        )}
                        {item.location && (
                          <Typography variant="body2" color="text.secondary">
                            地點：{item.location}
                          </Typography>
                        )}
                        {item.cost?.amount && (
                          <Typography variant="body2" color="text.secondary">
                            費用：{item.cost.amount} {item.cost.currency}
                          </Typography>
                        )}
                        {item.notes && (
                          <Typography variant="body2" color="text.secondary">
                            備註：{item.notes}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedItem ? '編輯項目' : '新增項目'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>類型</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="類型"
                >
                  {Object.entries(ITEM_TYPES).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="標題"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="時間"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="地點"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="費用"
                type="number"
                value={formData.cost.amount}
                onChange={(e) => setFormData({
                  ...formData,
                  cost: { ...formData.cost, amount: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>幣別</InputLabel>
                <Select
                  value={formData.cost.currency}
                  onChange={(e) => setFormData({
                    ...formData,
                    cost: { ...formData.cost, currency: e.target.value }
                  })}
                  label="幣別"
                >
                  <MenuItem value="TWD">TWD</MenuItem>
                  <MenuItem value="THB">THB</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="備註"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">
            儲存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ItineraryManagement; 