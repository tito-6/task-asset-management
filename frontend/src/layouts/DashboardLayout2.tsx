import { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { useAppDispatch, useAppSelector } from "../app/hooks.js";
import { logout } from "../features/auth/authSlice.js";
import { useThemeMode } from "../context/ThemeContext.js";

const drawerWidth = 240;
const collapsedDrawerWidth = 65;

const navItems = [
  { label: "Assets", path: "/assets", icon: <DashboardIcon /> },
  { label: "Tasks", path: "/tasks", icon: <AssignmentIcon /> },
];

const DashboardLayout2 = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleCollapseToggle = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar>
        {!isCollapsed && (
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
            Asset Manager
          </Typography>
        )}
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1, pt: 2 }}>
        {navItems.map((item) => (
          <motion.div
            key={item.path}
            whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Tooltip title={isCollapsed ? item.label : ""} placement="right" arrow>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={location.pathname.startsWith(item.path)}
                onClick={() => setMobileOpen(false)}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 2,
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  px: isCollapsed ? 0 : 2,
                  "&.Mui-selected": {
                    backgroundColor: theme.palette.primary.main,
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                    },
                    "& .MuiListItemIcon-root": {
                      color: "#fff",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname.startsWith(item.path)
                      ? "#fff"
                      : theme.palette.text.secondary,
                    minWidth: isCollapsed ? "auto" : 40,
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!isCollapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </motion.div>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 1, display: "flex", justifyContent: "center" }}>
        <Tooltip title={isCollapsed ? "Expand" : "Collapse"} placement="right">
          <IconButton 
            onClick={handleCollapseToggle}
            sx={{
              backgroundColor: theme.palette.action.hover,
              "&:hover": {
                backgroundColor: theme.palette.action.selected,
              },
            }}
          >
            {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: 1201,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              display: { xs: "none", sm: "block" },
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            Asset & Task Management
          </Typography>
          {user && (
            <Typography
              variant="body2"
              sx={{
                mr: 2,
                px: 2,
                py: 0.5,
                borderRadius: 2,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(59, 130, 246, 0.1)' 
                  : 'rgba(59, 130, 246, 0.1)',
                border: `1px solid ${theme.palette.primary.main}`,
                fontWeight: 500,
              }}
            >
              {user.name}
            </Typography>
          )}
          <IconButton onClick={toggleTheme} color="inherit" sx={{ mr: 1 }}>
            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <IconButton onClick={handleLogout} color="inherit">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ 
          width: { sm: isCollapsed ? collapsedDrawerWidth : drawerWidth }, 
          flexShrink: { sm: 0 },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: isCollapsed ? collapsedDrawerWidth : drawerWidth,
              mt: 8,
              height: "calc(100% - 64px)",
              overflowX: "hidden",
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
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
          width: { sm: `calc(100% - ${isCollapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          mt: 8,
          minHeight: "calc(100vh - 64px)",
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default DashboardLayout2;
