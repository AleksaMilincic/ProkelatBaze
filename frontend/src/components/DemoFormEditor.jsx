import React, { useState } from 'react';
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
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DragIndicator as DragIcon,
  Save as SaveIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';

const fieldTypes = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Date' }
];

const DemoFormEditor = () => {
  const [form, setForm] = useState({
    title: 'Customer Feedback Form',
    description: 'Please help us improve our services by providing your feedback.',
    fields: [
      {
        type: 'text',
        label: 'Full Name',
        name: 'full_name',
        placeholder: 'Enter your full name',
        required: true,
        order: 0
      },
      {
        type: 'email',
        label: 'Email Address',
        name: 'email',
        placeholder: 'your.email@example.com',
        required: true,
        order: 1
      },
      {
        type: 'select',
        label: 'Service Used',
        name: 'service',
        required: true,
        options: [
          { value: 'support', label: 'Customer Support' },
          { value: 'billing', label: 'Billing' },
          { value: 'technical', label: 'Technical Support' }
        ],
        order: 2
      },
      {
        type: 'radio',
        label: 'Satisfaction Rating',
        name: 'rating',
        required: true,
        options: [
          { value: '5', label: 'Excellent' },
          { value: '4', label: 'Good' },
          { value: '3', label: 'Average' },
          { value: '2', label: 'Poor' },
          { value: '1', label: 'Very Poor' }
        ],
        order: 3
      },
      {
        type: 'textarea',
        label: 'Additional Comments',
        name: 'comments',
        placeholder: 'Please share any additional feedback...',
        required: false,
        order: 4
      }
    ],
    settings: {
      isPublic: true,
      allowAnonymous: true,
      collectResponses: true
    },
    status: 'active'
  });

  const [showPreview, setShowPreview] = useState(false);

  const handleAddField = () => {
    const newField = {
      type: 'text',
      label: 'New Field',
      name: `field_${form.fields.length}`,
      placeholder: '',
      required: false,
      order: form.fields.length
    };
    setForm({ ...form, fields: [...form.fields, newField] });
  };

  const handleDeleteField = (index) => {
    const newFields = form.fields.filter((_, i) => i !== index);
    setForm({ ...form, fields: newFields });
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

  const renderPreviewField = (field) => {
    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <TextField
            fullWidth
            label={field.label}
            placeholder={field.placeholder}
            type={field.type}
            required={field.required}
            variant="outlined"
          />
        );
      case 'textarea':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            variant="outlined"
          />
        );
      case 'select':
        return (
          <FormControl fullWidth required={field.required}>
            <InputLabel>{field.label}</InputLabel>
            <Select label={field.label}>
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      default:
        return (
          <TextField
            fullWidth
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            variant="outlined"
          />
        );
    }
  };

  if (showPreview) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Form Preview</Typography>
          <Button
            variant="contained"
            onClick={() => setShowPreview(false)}
          >
            Back to Editor
          </Button>
        </Box>
        
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {form.title}
          </Typography>
          {form.description && (
            <Typography variant="body1" color="text.secondary" paragraph>
              {form.description}
            </Typography>
          )}
          <Divider sx={{ my: 3 }} />
          
          <Grid container spacing={3}>
            {form.fields.map((field, index) => (
              <Grid item xs={12} key={index}>
                {renderPreviewField(field)}
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button variant="contained" size="large" sx={{ minWidth: 200 }}>
              Submit
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Form Editor Demo</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={() => setShowPreview(true)}
          >
            Preview
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => alert('Form saved successfully!')}
          >
            Save Form
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <TextField
              fullWidth
              label="Form Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              sx={{ mb: 2 }}
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
                    <IconButton size="small">
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
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Form Status
            </Typography>
            <Chip
              label={form.status}
              color={getStatusColor(form.status)}
              sx={{ mb: 2 }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch checked={form.settings.isPublic} />
              }
              label="Public Form"
            />
            <FormControlLabel
              control={
                <Switch checked={form.settings.allowAnonymous} />
              }
              label="Allow Anonymous"
            />
            <FormControlLabel
              control={
                <Switch checked={form.settings.collectResponses} />
              }
              label="Collect Responses"
            />
          </Paper>
          
          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Form Statistics
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Fields: {form.fields.length}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Required Fields: {form.fields.filter(f => f.required).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Estimated Completion: 2-3 minutes
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DemoFormEditor;