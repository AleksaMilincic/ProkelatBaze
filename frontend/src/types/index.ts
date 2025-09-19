export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'moderator';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
}

export interface FormField {
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'number' | 'email' | 'date' | 'file';
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  order?: number;
}

export interface Form {
  _id: string;
  title: string;
  description?: string;
  fields: FormField[];
  creator: User;
  collaborators: {
    userId: User;
    role: 'viewer' | 'editor' | 'admin';
    addedAt: Date;
  }[];
  settings: {
    isPublic: boolean;
    allowAnonymous: boolean;
    collectResponses: boolean;
    showResponseSummary: boolean;
    closeAt?: Date;
    maxResponses?: number;
  };
  status: 'draft' | 'active' | 'closed' | 'archived';
  responseCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Response {
  _id: string;
  formId: string;
  submittedBy?: User;
  submittedByEmail?: string;
  answers: {
    fieldName: string;
    fieldLabel: string;
    fieldType: string;
    value: any;
    files?: {
      filename: string;
      originalName: string;
      mimeType: string;
      size: number;
      url: string;
    }[];
  }[];
  submissionData: {
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
  };
  status: 'submitted' | 'reviewed' | 'flagged' | 'archived';
  review?: {
    reviewedBy: User;
    reviewedAt: Date;
    notes?: string;
    rating?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  _id: string;
  formId: string;
  author: User;
  content: string;
  mentions: {
    userId: User;
    username: string;
  }[];
  parentComment?: string;
  isResolved: boolean;
  resolvedBy?: User;
  resolvedAt?: Date;
  fieldReference?: {
    fieldName: string;
    fieldLabel: string;
  };
  replies?: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  _id: string;
  formId: string;
  user: User;
  action: string;
  details: any;
  metadata: {
    ipAddress: string;
    userAgent: string;
  };
  createdAt: Date;
}