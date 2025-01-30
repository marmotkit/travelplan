import { useState } from 'react';
import { useNavigate, useOutlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ListAlt as ListAltIcon,
  Hotel as HotelIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { authApi } from '../services/authApi';
import Footer from './Footer';

const drawerWidth = 240;

export default function Layout() {
  const outlet = useOutlet();  // 直接使用 useOutlet
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const isAdmin = authApi.isAdmin();
  const [version, setVersion] = useState(() => {
    return localStorage.getItem('appVersion') || '1.0';
  });
  
  const adminMenuItems = [
    { text: '用戶管理', icon: <PeopleIcon />, path: '/users' }
  ];
  
  const userMenuItems = [
    { text: '儀表板', icon: <DashboardIcon />, path: '/dashboard' },
    { text: '活動管理', icon: <ListAltIcon />, path: '/plans' },
    { text: '住宿管理', icon: <HotelIcon />, path: '/accommodations' },
    { text: '預算管理', icon: <AttachMoneyIcon />, path: '/budgets' }
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  const handleMenuClick = (path) => {
    console.log('點擊菜單項:', path);
    console.log('當前用戶角色:', isAdmin ? 'admin' : 'user');
    navigate(path);
  };

  const handleVersionClick = (e) => {
    e.preventDefault();
    const [major, minor] = version.split('.');
    let newVersion;
    
    if (e.button === 0) { // 左鍵點擊
      if (minor === '9') {
        newVersion = `${parseInt(major) + 1}.0`;
      } else {
        newVersion = `${major}.${parseInt(minor) + 1}`;
      }
    } else if (e.button === 2) { // 右鍵點擊
      if (minor === '0') {
        if (major !== '1') {
          newVersion = `${parseInt(major) - 1}.9`;
        } else {
          newVersion = '1.0';
        }
      } else {
        newVersion = `${major}.${parseInt(minor) - 1}`;
      }
    }
    
    if (newVersion) {
      setVersion(newVersion);
      localStorage.setItem('appVersion', newVersion);
    }
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap>
          {isAdmin ? '管理員後台' : '旅遊行程管理'}
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => handleMenuClick(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem button onClick={handleLogout}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="登出" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            width: '100%'
          }}>
            <Typography variant="h6" noWrap component="div">
              {isAdmin ? '旅遊行程管理系統 - 管理員' : '旅遊行程管理系統'}
            </Typography>
            <Typography 
              variant="subtitle1"
              onMouseDown={handleVersionClick}
              onContextMenu={(e) => e.preventDefault()}
              sx={{ 
                cursor: 'pointer',
                userSelect: 'none',
                color: 'inherit'
              }}
            >
              V{version}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginTop: '64px',
        }}
      >
        <Toolbar />
        {outlet}  {/* 使用 outlet 而不是 children */}
        <Footer />
      </Box>
    </Box>
  );
} 