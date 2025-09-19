import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  AccountCircle,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { formService } from '../services/formService';

const DashboardPage = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await formService.getForms({ search });
        setForms(response.forms);
      } catch (error) {
        console.error('Error fetching forms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [search]);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'default';
      case 'active': return 'success';
      case 'closed': return 'warning';
      case 'archived': return 'error';
      default: return 'default';
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ProkelatBaze - Dashboard
          </Typography>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuClick}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              {user?.firstName} {user?.lastName}
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            My Forms
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to="/forms/new"
          >
            Create New Form
          </Button>
        </Box>

        <Box mb={3}>
          <TextField
            fullWidth
            placeholder="Search forms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Grid container spacing={3}>
            {forms.map((form) => (
              <Grid item xs={12} sm={6} md={4} key={form._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {form.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {form.description || 'No description'}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                      <Chip
                        label={form.status}
                        color={getStatusColor(form.status)}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {form.responseCount} responses
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      component={Link}
                      to={`/forms/${form._id}/edit`}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      component={Link}
                      to={`/forms/${form._id}`}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      startIcon={<BarChartIcon />}
                      component={Link}
                      to={`/forms/${form._id}/responses`}
                    >
                      Responses
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
            {forms.length === 0 && !loading && (
              <Grid item xs={12}>
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No forms found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Create your first form to get started
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    component={Link}
                    to="/forms/new"
                  >
                    Create New Form
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
    </>
  );
};

export default DashboardPage;