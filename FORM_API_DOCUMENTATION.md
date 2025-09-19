# Form Service API Documentation

## New Endpoints Added

### Collaborator Management

#### Update Collaborator Role
```
PUT /api/forms/:id/collaborators/:userId
```
**Description**: Update a collaborator's role in a form
**Authentication**: Required
**Authorization**: Only form creator can update roles
**Body**:
```json
{
  "role": "viewer|editor|admin"
}
```

#### Remove Collaborator
```
DELETE /api/forms/:id/collaborators/:userId
```
**Description**: Remove a collaborator from a form
**Authentication**: Required
**Authorization**: Form creator or the collaborator themselves

### Form Management

#### Duplicate Form
```
POST /api/forms/:id/duplicate
```
**Description**: Create a copy of an existing form
**Authentication**: Required
**Authorization**: Form creator, collaborators with editor/admin rights, or public forms
**Response**: Returns the duplicated form with title "Original Title (Copy)"

#### Update Form Status
```
PATCH /api/forms/:id/status
```
**Description**: Change form status
**Authentication**: Required
**Authorization**: Form creator or admin collaborators
**Body**:
```json
{
  "status": "draft|active|closed|archived"
}
```

#### Get Form Analytics
```
GET /api/forms/:id/analytics
```
**Description**: Get form statistics and analytics
**Authentication**: Required
**Authorization**: Form creator or collaborators
**Response**:
```json
{
  "analytics": {
    "totalResponses": 0,
    "formStatus": "draft",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastUpdated": "2024-01-01T00:00:00.000Z",
    "isPublic": false,
    "allowAnonymous": true,
    "collaboratorCount": 2,
    "fieldCount": 5
  }
}
```

## Environment Configuration

All services now use consistent JWT_SECRET configuration. Create `.env` files in each service directory with:

```env
JWT_SECRET=your_secure_jwt_secret_here
MONGODB_URI=mongodb://localhost:27017/your_database
PORT=service_port
```

## Frontend Service Updates

The `formService.js` has been updated with new methods:
- `duplicateForm(id)`
- `updateFormStatus(id, status)`
- `getFormAnalytics(id)`
- `updateCollaborator(formId, userId, role)`
- `removeCollaborator(formId, userId)`

All endpoints include proper error handling and return consistent response formats.