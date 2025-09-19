import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  AppBar,
  Toolbar,
  FormControl,
  InputLabel,
  Select,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  GetApp as ExportIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { responseService } from '../services/responseService';
import { formService } from '../services/formService';

const ResponsesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filtering and search
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Menu and dialogs
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);

  const loadForm = useCallback(async () => {
    try {
      const response = await formService.getForm(id);
      setForm(response.form);
    } catch (error) {
      setError('Failed to load form');
      console.error('Error loading form:', error);
    }
  }, [id]);

  const loadResponses = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search,
        dateFilter
      };
      
      const response = await responseService.getResponses(id, params);
      setResponses(response.responses || []);
      setTotalCount(response.total || 0);
    } catch (error) {
      setError('Failed to load responses');
      console.error('Error loading responses:', error);
    } finally {
      setLoading(false);
    }
  }, [id, page, rowsPerPage, search, dateFilter]);

  const loadAnalytics = useCallback(async () => {
    try {
      const response = await responseService.getAnalytics(id);
      setAnalytics(response);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  }, [id]);

  useEffect(() => {
    loadForm();
    loadResponses();
    loadAnalytics();
  }, [loadForm, loadResponses, loadAnalytics]);

  const handleExport = async (format) => {
    try {
      const blob = await responseService.exportResponses(id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${form?.title || 'form'}_responses.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError(`Failed to export responses as ${format.toUpperCase()}`);
    }
    setAnchorEl(null);
  };

  const handleDeleteResponse = async (responseId) => {
    try {
      await responseService.deleteResponse(id, responseId);
      loadResponses(); // Reload responses
    } catch (error) {
      setError('Failed to delete response');
    }
  };

  const handleViewResponse = (response) => {
    setSelectedResponse(response);
    setViewDialog(true);
  };

  const formatResponseValue = (field, value) => {
    if (value === null || value === undefined) return '-';
    
    switch (field.type) {
      case 'checkbox':
        return Array.isArray(value) ? value.join(', ') : value;
      case 'select':
      case 'radio':
        const option = field.options?.find(opt => opt.value === value);
        return option ? option.label : value;
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'file':
        return value ? 'File uploaded' : 'No file';
      default:
        return value.toString();
    }
  };

  const getFieldAnalytics = (field) => {
    if (!analytics?.fieldAnalytics) return null;
    return analytics.fieldAnalytics[field.name];
  };

  if (loading && responses.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Responses: {form?.title}
          </Typography>
          <Button
            color="inherit"
            startIcon={<AssessmentIcon />}
            onClick={() => setShowAnalytics(!showAnalytics)}
            sx={{ mr: 1 }}
          >
            Analytics
          </Button>
          <Button
            color="inherit"
            startIcon={<ExportIcon />}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            Export
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Analytics Section */}
        {showAnalytics && analytics && (
          <Accordion sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Response Analytics</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="primary">
                        {analytics.totalResponses || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Responses
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="primary">
                        {analytics.responseRate ? `${analytics.responseRate}%` : 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Response Rate
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="primary">
                        {analytics.avgCompletionTime || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg. Completion Time
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="primary">
                        {analytics.completionRate ? `${analytics.completionRate}%` : 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Completion Rate
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Field Analytics */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Field Analytics
                </Typography>
                <Grid container spacing={2}>
                  {form?.fields?.map((field) => {
                    const fieldAnalytics = getFieldAnalytics(field);
                    if (!fieldAnalytics) return null;

                    return (
                      <Grid item xs={12} md={6} key={field.name}>
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            {field.label}
                          </Typography>
                          {fieldAnalytics.mostCommon && (
                            <Typography variant="body2" color="text.secondary">
                              Most common: {fieldAnalytics.mostCommon}
                            </Typography>
                          )}
                          {fieldAnalytics.responseCount && (
                            <Typography variant="body2" color="text.secondary">
                              Responses: {fieldAnalytics.responseCount}
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Search responses..."
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
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Date Filter</InputLabel>
                <Select
                  value={dateFilter}
                  label="Date Filter"
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12} md={5}>
              <Box display="flex" justifyContent="flex-end" gap={1}>
                <Chip 
                  label={`${totalCount} total responses`} 
                  color="primary" 
                  variant="outlined" 
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Responses Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Submitted</TableCell>
                {form?.fields?.slice(0, 3).map((field) => (
                  <TableCell key={field.name}>{field.label}</TableCell>
                ))}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : responses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No responses found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                responses.map((response, index) => (
                  <TableRow key={response._id || index}>
                    <TableCell>
                      {response._id?.slice(-8) || `R${index + 1}`}
                    </TableCell>
                    <TableCell>
                      {response.submittedAt 
                        ? new Date(response.submittedAt).toLocaleDateString()
                        : 'Unknown'
                      }
                    </TableCell>
                    {form?.fields?.slice(0, 3).map((field) => (
                      <TableCell key={field.name}>
                        {formatResponseValue(field, response.responses?.[field.name])}
                      </TableCell>
                    ))}
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleViewResponse(response)}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteResponse(response._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>

        {/* Export Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => handleExport('csv')}>
            Export as CSV
          </MenuItem>
          <MenuItem onClick={() => handleExport('xlsx')}>
            Export as Excel
          </MenuItem>
          <MenuItem onClick={() => handleExport('json')}>
            Export as JSON
          </MenuItem>
        </Menu>

        {/* View Response Dialog */}
        <Dialog
          open={viewDialog}
          onClose={() => setViewDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Response Details
          </DialogTitle>
          <DialogContent>
            {selectedResponse && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Submitted: {selectedResponse.submittedAt 
                    ? new Date(selectedResponse.submittedAt).toLocaleString()
                    : 'Unknown'
                  }
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {form?.fields?.map((field) => (
                    <Grid item xs={12} key={field.name}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {field.label}
                        </Typography>
                        <Typography variant="body1">
                          {formatResponseValue(field, selectedResponse.responses?.[field.name])}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default ResponsesPage;