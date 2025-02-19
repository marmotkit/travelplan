import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import planAPI from '../api/plan';
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Paper,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const STATUS_OPTIONS = [
  { value: 'planning', label: '計劃中' },
  { value: 'scheduled', label: '排程中' },
  { value: 'ongoing', label: '進行中' },
  { value: 'completed', label: '已結案' },
];

export default function PlanForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    startDate: null,
    endDate: null,
    status: 'planning',
    description: '',
  });

  useEffect(() => {
    if (id) {
      fetchPlan();
    }
  }, [id]);

  const fetchPlan = async () => {
    try {
      const data = await planAPI.get(id);
      setFormData({
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      });
    } catch (error) {
      console.error('Error fetching plan:', error);
      navigate('/plans');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name) => (date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedData = {
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : null,
    };
    try {
      if (id) {
        await planAPI.update(id, formattedData);
      } else {
        await planAPI.create(formattedData);
      }
      navigate('/plans');
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {id ? '編輯活動' : '新增活動'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              name="title"
              label="活動標題"
              value={formData.title}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="開始日期"
              value={formData.startDate}
              onChange={handleDateChange('startDate')}
              format="yyyy-MM-dd"
              slotProps={{ 
                textField: { fullWidth: true, required: true },
                field: { clearable: true }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="結束日期"
              value={formData.endDate}
              onChange={handleDateChange('endDate')}
              format="yyyy-MM-dd"
              slotProps={{ 
                textField: { fullWidth: true, required: true },
                field: { clearable: true }
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              name="status"
              label="狀態"
              value={formData.status}
              onChange={handleChange}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              name="description"
              label="行程描述"
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/plans')}
              >
                取消
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                儲存
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
} 