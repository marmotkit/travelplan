import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { userApi } from '../services/authApi';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/authApi';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const isAdmin = authApi.isAdmin();

  const loadUsers = async () => {
    try {
      console.log('正在載入用戶列表...');
      const data = await userApi.getAll();
      console.log('用戶列表載入成功:', data);
      setUsers(data);
    } catch (error) {
      console.error('載入用戶列表失敗:', error);
      setError('載入用戶列表失敗');
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    
    console.log('UserManagement 組件已掛載');
    loadUsers();
  }, [isAdmin, navigate]);

  const handleOpenDialog = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        username: user.username,
        password: '',
        name: user.name,
        role: user.role
      });
    } else {
      setSelectedUser(null);
      setFormData({
        username: '',
        password: '',
        name: '',
        role: 'user'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      username: '',
      password: '',
      name: '',
      role: 'user'
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedUser) {
        await userApi.update(selectedUser._id, formData);
      } else {
        await userApi.create(formData);
      }
      await loadUsers();
      handleCloseDialog();
    } catch (error) {
      setError(error.response?.data?.message || '操作失敗');
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('確定要停用此用戶？')) return;
    
    try {
      await userApi.delete(id);
      await loadUsers();
    } catch (error) {
      setError('停用用戶失敗');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">用戶管理</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          新增用戶
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
              <TableCell>用戶名</TableCell>
              <TableCell>姓名</TableCell>
              <TableCell>角色</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role === 'admin' ? '管理員' : '一般用戶'}
                    color={user.role === 'admin' ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? '啟用' : '停用'}
                    color={user.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(user)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeactivate(user._id)}
                  >
                    <BlockIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedUser ? '編輯用戶' : '新增用戶'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="用戶名"
            name="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            margin="normal"
            disabled={!!selectedUser}
          />
          <TextField
            fullWidth
            label="密碼"
            name="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            margin="normal"
            required={!selectedUser}
            helperText={selectedUser ? '留空表示不修改密碼' : ''}
          />
          <TextField
            fullWidth
            label="姓名"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <Select
            fullWidth
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            sx={{ mt: 2 }}
          >
            <MenuItem value="user">一般用戶</MenuItem>
            <MenuItem value="admin">管理員</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">
            確定
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement; 