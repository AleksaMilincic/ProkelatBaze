import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { formService } from '../services/formService';
import { responseService } from '../services/responseService';

const FormViewPage = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const loadForm = useCallback(async () => {
    try {
      setLoading(true);
      const response = await formService.getForm(id);
      setForm(response.form);
    } catch (error) {
      setError('Form not found or not accessible');
      console.error('Error loading form:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadForm();
  }, [loadForm]);

  const handleFieldChange = (fieldName, value) => {
    setResponses(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    form.fields.forEach(field => {
      if (field.required && (!responses[field.name] || responses[field.name].toString().trim() === '')) {
        errors[field.name] = 'This field is required';
      }

      // Type-specific validation
      if (responses[field.name]) {
        const value = responses[field.name];
        
        switch (field.type) {
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors[field.name] = 'Please enter a valid email address';
            }
            break;
          case 'number':
            if (isNaN(value)) {
              errors[field.name] = 'Please enter a valid number';
            } else {
              const num = parseFloat(value);
              if (field.validation?.min !== undefined && num < field.validation.min) {
                errors[field.name] = `Minimum value is ${field.validation.min}`;
              }
              if (field.validation?.max !== undefined && num > field.validation.max) {
                errors[field.name] = `Maximum value is ${field.validation.max}`;
              }
            }
            break;
          default:
            if (field.validation?.pattern) {
              const regex = new RegExp(field.validation.pattern);
              if (!regex.test(value)) {
                errors[field.name] = field.validation.message || 'Invalid format';
              }
            }
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      await responseService.submitResponse(id, {
        formId: id,
        responses: responses,
        submittedAt: new Date().toISOString()
      });
      
      setSubmitted(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const fieldError = validationErrors[field.name];
    const commonProps = {
      error: Boolean(fieldError),
      helperText: fieldError,
    };

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <TextField
            key={field.name}
            fullWidth
            label={field.label}
            placeholder={field.placeholder}
            value={responses[field.name] || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
            type={field.type}
            {...commonProps}
          />
        );

      case 'textarea':
        return (
          <TextField
            key={field.name}
            fullWidth
            multiline
            rows={4}
            label={field.label}
            placeholder={field.placeholder}
            value={responses[field.name] || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
            {...commonProps}
          />
        );

      case 'number':
        return (
          <TextField
            key={field.name}
            fullWidth
            type="number"
            label={field.label}
            placeholder={field.placeholder}
            value={responses[field.name] || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
            inputProps={{
              min: field.validation?.min,
              max: field.validation?.max
            }}
            {...commonProps}
          />
        );

      case 'date':
        return (
          <TextField
            key={field.name}
            fullWidth
            type="date"
            label={field.label}
            value={responses[field.name] || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
            InputLabelProps={{ shrink: true }}
            {...commonProps}
          />
        );

      case 'select':
        return (
          <FormControl key={field.name} fullWidth {...commonProps}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={responses[field.name] || ''}
              label={field.label}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              required={field.required}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'radio':
        return (
          <FormControl key={field.name} component="fieldset" {...commonProps}>
            <FormLabel component="legend">{field.label}</FormLabel>
            <RadioGroup
              value={responses[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            >
              {field.options?.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControl key={field.name} component="fieldset" {...commonProps}>
            <FormLabel component="legend">{field.label}</FormLabel>
            {field.options?.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    checked={(responses[field.name] || []).includes(option.value)}
                    onChange={(e) => {
                      const currentValues = responses[field.name] || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter(v => v !== option.value);
                      handleFieldChange(field.name, newValues);
                    }}
                  />
                }
                label={option.label}
              />
            ))}
          </FormControl>
        );

      case 'file':
        return (
          <Box key={field.name}>
            <Typography variant="body2" gutterBottom>
              {field.label} {field.required && '*'}
            </Typography>
            <input
              type="file"
              onChange={(e) => handleFieldChange(field.name, e.target.files[0])}
              style={{ width: '100%' }}
            />
            {fieldError && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {fieldError}
              </Typography>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !form) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!form) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Form not found</Alert>
      </Container>
    );
  }

  if (form.status !== 'active') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          This form is currently {form.status} and not accepting responses.
        </Alert>
      </Container>
    );
  }

  if (submitted) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Thank You!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your response has been submitted successfully.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
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

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {form.fields
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((field) => (
                <Grid item xs={12} key={field.name}>
                  {renderField(field)}
                </Grid>
              ))}
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              sx={{ minWidth: 200 }}
            >
              {submitting ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
          </Box>
        </Box>

        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            Powered by ProkelatBaze
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default FormViewPage;