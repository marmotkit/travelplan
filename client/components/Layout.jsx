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
  Event as EventIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

// 創建一個默認的用戶
const defaultUser = {
  username: 'marmot',
  name: '梁坤棠',
  role: 'admin'
};

export default function Layout() {
  const outlet = useOutlet();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { text: '儀表板', icon: <DashboardIcon />, path: '/dashboard' },
    { text: '活動管理', icon: <EventIcon />, path: '/activities' },
    { text: '行程計劃', icon: <ListAltIcon />, path: '/plans' },
    { text: '住宿管理', icon: <HotelIcon />, path: '/accommodations' },
    { text: '預算管理', icon: <AttachMoneyIcon />, path: '/budgets' }
  ];

  // 如果是管理員，添加用戶管理選項
  if (defaultUser.role === 'admin') {
    menuItems.push({ text: '用戶管理', icon: <PeopleIcon />, path: '/users' });
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (path) => {
    console.log('點擊菜單項:', path);
    console.log('當前用戶角色:', defaultUser.role);
    navigate(path);
    setMobileOpen(false);
  };

  const drawer = (
    <div>
      <Toolbar />
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
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            旅遊計劃系統
          </Typography>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            {defaultUser.name}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
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
        }}
      >
        <Toolbar />
        {outlet}
      </Box>
    </Box>
  );
}