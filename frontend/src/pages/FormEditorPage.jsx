import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
  Alert,
  Divider,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DragIndicator as DragIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Settings as SettingsIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { formService } from '../services/formService';

const fieldTypes = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Date' },
  { value: 'file', label: 'File Upload' }
];

const FormEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    title: '',
    description: '',
    fields: [],
    settings: {
      isPublic: false,
      allowAnonymous: true,
      collectResponses: true,
      showResponseSummary: false
    },
    status: 'draft'
  });

  const [openFieldDialog, setOpenFieldDialog] = useState(false);
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const [currentField, setCurrentField] = useState(null);
  const [fieldForm, setFieldForm] = useState({
    type: 'text',
    label: '',
    name: '',
    placeholder: '',
    required: false,
    options: [],
    validation: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadForm = useCallback(async () => {
    try {
      setLoading(true);
      const response = await formService.getForm(id);
      setForm(response.form);
    } catch (error) {
      setError('Failed to load form');
      console.error('Error loading form:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEditing) {
      loadForm();
    }
  }, [isEditing, loadForm]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!form.title.trim()) {
        setError('Form title is required');
        return;
      }

      if (isEditing) {
        await formService.updateForm(id, form);
        setSuccess('Form updated successfully');
      } else {
        const response = await formService.createForm(form);
        setSuccess('Form created successfully');
        navigate(`/forms/${response.form._id}/edit`);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save form');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (id) {
      window.open(`/forms/${id}`, '_blank');
    }
  };

  const handleAddField = () => {
    setCurrentField(null);
    setFieldForm({
      type: 'text',
      label: '',
      name: '',
      placeholder: '',
      required: false,
      options: [],
      validation: {}
    });
    setOpenFieldDialog(true);
  };

  const handleEditField = (field, index) => {
    setCurrentField(index);
    setFieldForm({ ...field });
    setOpenFieldDialog(true);
  };

  const handleDeleteField = (index) => {
    const newFields = form.fields.filter((_, i) => i !== index);
    setForm({ ...form, fields: newFields });
  };

  const handleSaveField = () => {
    if (!fieldForm.label.trim() || !fieldForm.name.trim()) {
      return;
    }

    const field = {
      ...fieldForm,
      order: currentField !== null ? form.fields[currentField].order : form.fields.length
    };

    let newFields;
    if (currentField !== null) {
      newFields = [...form.fields];
      newFields[currentField] = field;
    } else {
      newFields = [...form.fields, field];
    }

    setForm({ ...form, fields: newFields });
    setOpenFieldDialog(false);
  };

  const handleFieldOptionAdd = () => {
    setFieldForm({
      ...fieldForm,
      options: [...fieldForm.options, { value: '', label: '' }]
    });
  };

  const handleFieldOptionChange = (index, key, value) => {
    const newOptions = [...fieldForm.options];
    newOptions[index][key] = value;
    setFieldForm({ ...fieldForm, options: newOptions });
  };

  const handleFieldOptionDelete = (index) => {
    const newOptions = fieldForm.options.filter((_, i) => i !== index);
    setFieldForm({ ...fieldForm, options: newOptions });
  };

  // Future implementation for drag and drop
  // const moveField = (fromIndex, toIndex) => {
  //   const newFields = [...form.fields];
  //   const [movedField] = newFields.splice(fromIndex, 1);
  //   newFields.splice(toIndex, 0, movedField);
  //   
  //   // Update order
  //   newFields.forEach((field, index) => {
  //     field.order = index;
  //   });
  //   
  //   setForm({ ...form, fields: newFields });
  // };

  const needsOptions = ['select', 'checkbox', 'radio'].includes(fieldForm.type);

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
            {isEditing ? 'Edit Form' : 'Create New Form'}
          </Typography>
          <Button
            color="inherit"
            startIcon={<SettingsIcon />}
            onClick={() => setOpenSettingsDialog(true)}
            sx={{ mr: 1 }}
          >
            Settings
          </Button>
          {isEditing && (
            <Button
              color="inherit"
              startIcon={<PreviewIcon />}
              onClick={handlePreview}
              sx={{ mr: 1 }}
            >
              Preview
            </Button>
          )}
          <Button
            color="inherit"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading}
          >
            Save
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <TextField
                fullWidth
                label="Form Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Form Description"
                multiline
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Form Fields</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddField}
                >
                  Add Field
                </Button>
              </Box>

              {form.fields.length === 0 ? (
                <Box
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    color: 'text.secondary'
                  }}
                >
                  <Typography variant="body1">
                    No fields added yet. Click "Add Field" to get started.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {form.fields.map((field, index) => (
                    <Card key={index} variant="outlined">
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={1}>
                          <DragIcon sx={{ mr: 1, color: 'text.secondary', cursor: 'grab' }} />
                          <Chip
                            label={fieldTypes.find(t => t.value === field.type)?.label}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            {field.label}
                          </Typography>
                          {field.required && (
                            <Chip label="Required" size="small" color="error" sx={{ mr: 1 }} />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Name: {field.name}
                        </Typography>
                        {field.placeholder && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Placeholder: {field.placeholder}
                          </Typography>
                        )}
                        {field.options && field.options.length > 0 && (
                          <Box mt={1}>
                            <Typography variant="caption" color="text.secondary">
                              Options: {field.options.map(opt => opt.label).join(', ')}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                      <CardActions>
                        <IconButton
                          size="small"
                          onClick={() => handleEditField(field, index)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteField(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Form Status
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={form.status}
                  label="Status"
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Quick Settings
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.settings.isPublic}
                    onChange={(e) => setForm({
                      ...form,
                      settings: { ...form.settings, isPublic: e.target.checked }
                    })}
                  />
                }
                label="Public Form"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.settings.allowAnonymous}
                    onChange={(e) => setForm({
                      ...form,
                      settings: { ...form.settings, allowAnonymous: e.target.checked }
                    })}
                  />
                }
                label="Allow Anonymous"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.settings.collectResponses}
                    onChange={(e) => setForm({
                      ...form,
                      settings: { ...form.settings, collectResponses: e.target.checked }
                    })}
                  />
                }
                label="Collect Responses"
              />
            </Paper>
          </Grid>
        </Grid>

        {/* Field Editor Dialog */}
        <Dialog open={openFieldDialog} onClose={() => setOpenFieldDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {currentField !== null ? 'Edit Field' : 'Add New Field'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Field Type</InputLabel>
                    <Select
                      value={fieldForm.type}
                      label="Field Type"
                      onChange={(e) => setFieldForm({ ...fieldForm, type: e.target.value })}
                    >
                      {fieldTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={fieldForm.required}
                        onChange={(e) => setFieldForm({ ...fieldForm, required: e.target.checked })}
                      />
                    }
                    label="Required Field"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Field Label"
                    value={fieldForm.label}
                    onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Field Name"
                    value={fieldForm.name}
                    onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value.replace(/\s+/g, '_').toLowerCase() })}
                    required
                    helperText="Used for data collection (auto-generated from label)"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Placeholder Text"
                    value={fieldForm.placeholder}
                    onChange={(e) => setFieldForm({ ...fieldForm, placeholder: e.target.value })}
                  />
                </Grid>

                {needsOptions && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Options
                    </Typography>
                    {fieldForm.options.map((option, index) => (
                      <Box key={index} display="flex" gap={1} mb={1}>
                        <TextField
                          label="Value"
                          value={option.value}
                          onChange={(e) => handleFieldOptionChange(index, 'value', e.target.value)}
                          size="small"
                        />
                        <TextField
                          label="Label"
                          value={option.label}
                          onChange={(e) => handleFieldOptionChange(index, 'label', e.target.value)}
                          size="small"
                          sx={{ flexGrow: 1 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleFieldOptionDelete(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                    <Button
                      startIcon={<AddIcon />}
                      onClick={handleFieldOptionAdd}
                      size="small"
                    >
                      Add Option
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenFieldDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSaveField}
              variant="contained"
              disabled={!fieldForm.label.trim() || !fieldForm.name.trim()}
            >
              Save Field
            </Button>
          </DialogActions>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={openSettingsDialog} onClose={() => setOpenSettingsDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Form Settings</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.settings.isPublic}
                    onChange={(e) => setForm({
                      ...form,
                      settings: { ...form.settings, isPublic: e.target.checked }
                    })}
                  />
                }
                label="Public Form"
              />
              <Typography variant="caption" display="block" color="text.secondary" mb={2}>
                Public forms can be accessed by anyone with the link
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={form.settings.allowAnonymous}
                    onChange={(e) => setForm({
                      ...form,
                      settings: { ...form.settings, allowAnonymous: e.target.checked }
                    })}
                  />
                }
                label="Allow Anonymous Responses"
              />
              <Typography variant="caption" display="block" color="text.secondary" mb={2}>
                Allow users to submit responses without logging in
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={form.settings.collectResponses}
                    onChange={(e) => setForm({
                      ...form,
                      settings: { ...form.settings, collectResponses: e.target.checked }
                    })}
                  />
                }
                label="Collect Responses"
              />
              <Typography variant="caption" display="block" color="text.secondary" mb={2}>
                Save and store form responses
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={form.settings.showResponseSummary}
                    onChange={(e) => setForm({
                      ...form,
                      settings: { ...form.settings, showResponseSummary: e.target.checked }
                    })}
                  />
                }
                label="Show Response Summary"
              />
              <Typography variant="caption" display="block" color="text.secondary" mb={2}>
                Display summary of responses to form submitters
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSettingsDialog(false)} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default FormEditorPage;