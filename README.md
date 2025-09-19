# ProkelatBaze - Microservices Form Builder

A comprehensive microservices-based form builder application built with the MERN stack (MongoDB, Express.js, React, Node.js), featuring authentication, form management, response handling, and real-time collaboration.

## 🏗️ Architecture

This application follows a microservices architecture with the following services:

### Services Overview

1. **Auth Service** (Port 3001)
   - User authentication and authorization
   - JWT token management
   - User profile management

2. **Form Service** (Port 3002)
   - Form creation and management
   - Form field configuration
   - Collaboration settings
   - Form sharing and permissions

3. **Responses Service** (Port 3003)
   - Form response collection
   - Response analytics
   - Data export capabilities

4. **Collaboration Service** (Port 3004)
   - Real-time collaboration features
   - Comments and discussions
   - Activity tracking
   - Socket.IO for real-time updates

5. **Frontend** (Port 3000)
   - React TypeScript application
   - Material-UI components
   - Real-time updates via Socket.IO

### Shared Components

- **Shared Library**: Common utilities, middleware, and database connections
- **MongoDB**: Separate databases for each service
- **Docker**: Containerized deployment

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB 5.0+
- Docker and Docker Compose (optional)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ProkelatBaze
   ```

2. **Install dependencies for all services**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   
   Copy the `.env.example` files in each service directory and update with your configuration:
   
   ```bash
   # Auth Service
   cp services/auth-service/.env.example services/auth-service/.env
   
   # Form Service  
   cp services/form-service/.env.example services/form-service/.env
   
   # Responses Service
   cp services/responses-service/.env.example services/responses-service/.env
   
   # Collaboration Service
   cp services/collaboration-service/.env.example services/collaboration-service/.env
   
   # Frontend
   cp frontend/.env.example frontend/.env
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   
   # Or use your local MongoDB installation
   ```

5. **Start all services in development mode**
   ```bash
   # Terminal 1 - Auth Service
   npm run dev:auth
   
   # Terminal 2 - Form Service
   npm run dev:form
   
   # Terminal 3 - Responses Service
   npm run dev:responses
   
   # Terminal 4 - Collaboration Service
   npm run dev:collaboration
   
   # Terminal 5 - Frontend
   npm run dev:frontend
   ```

### Docker Deployment

1. **Build and start all services**
   ```bash
   docker-compose up -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f
   ```

3. **Stop services**
   ```bash
   docker-compose down
   ```

## 📋 Features

### Authentication & Authorization
- User registration and login
- JWT-based authentication
- Role-based access control (user, admin, moderator)
- Secure password hashing with bcrypt

### Form Management
- Drag-and-drop form builder
- Multiple field types (text, textarea, select, checkbox, radio, etc.)
- Form validation rules
- Form status management (draft, active, closed, archived)
- Public/private form settings
- Anonymous submission support

### Collaboration
- Real-time collaborative editing
- User permissions (viewer, editor, admin)
- Comments and discussions
- Activity tracking
- Live user presence indicators

### Response Handling
- Anonymous and authenticated responses
- Response analytics and statistics
- Data export capabilities
- Response review and rating system
- Advanced filtering and search

### Real-time Features
- Live form editing
- Real-time comments
- User presence indicators
- Activity notifications
- Socket.IO integration

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **Socket.IO** - Real-time communication
- **Joi** - Data validation
- **Bcrypt** - Password hashing

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Material-UI** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Frontend web server
- **MongoDB** - Database

## 📁 Project Structure

```
ProkelatBaze/
├── services/
│   ├── auth-service/           # Authentication service
│   ├── form-service/           # Form management service
│   ├── responses-service/      # Response handling service
│   └── collaboration-service/  # Real-time collaboration service
├── frontend/                   # React frontend application
├── shared/                     # Shared utilities and configurations
├── docker-compose.yml          # Docker composition
├── package.json               # Root package.json with scripts
└── README.md                  # This file
```

## 🔧 API Documentation

### Auth Service (Port 3001)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/verify` - Verify JWT token

### Form Service (Port 3002)
- `GET /api/forms` - Get user's forms
- `POST /api/forms` - Create new form
- `GET /api/forms/:id` - Get specific form
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form
- `POST /api/forms/:id/collaborators` - Add collaborator

### Responses Service (Port 3003)
- `POST /api/responses` - Submit form response
- `GET /api/responses/form/:formId` - Get form responses
- `GET /api/responses/:id` - Get specific response
- `PUT /api/responses/:id/review` - Review response
- `GET /api/responses/form/:formId/analytics` - Get analytics

### Collaboration Service (Port 3004)
- `POST /api/comments` - Add comment
- `GET /api/comments/form/:formId` - Get form comments
- `PUT /api/comments/:id/resolve` - Resolve comment
- `GET /api/activities/form/:formId` - Get activity feed

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Helmet.js security headers
- Input validation with Joi
- MongoDB injection prevention

## 📊 Monitoring & Logging

- Health check endpoints for all services
- Structured logging
- Error handling middleware
- Request/response logging

## 🧪 Testing

```bash
# Run tests for specific service
cd services/auth-service
npm test

# Run all tests
npm run test:all
```

## 🚀 Deployment

### Production Environment Variables

Update the following environment variables for production:

```env
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret
MONGODB_URI=your-production-mongodb-uri
```

### Docker Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@prokelatbaze.com or create an issue in the repository.

## 🔮 Future Enhancements

- [ ] Advanced form analytics
- [ ] Email notifications
- [ ] Form templates
- [ ] Advanced field types
- [ ] API webhooks
- [ ] Form versioning
- [ ] Advanced collaboration features
- [ ] Mobile application
- [ ] Integration with third-party services