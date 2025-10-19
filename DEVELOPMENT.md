# Development Guide

## Getting Started

### 1. Clone and Install
```bash
git clone <repo-url>
cd restaurant-management-system
npm install
```

### 2. Firebase Emulator Setup
```bash
npm install -g firebase-tools
firebase init emulators
firebase emulators:start
```

### 3. Start Development Servers

**Terminal 1 - Backend**
```bash
cd backend
cp .env.example .env
# Edit .env with your Firebase credentials
npm run dev
```

**Terminal 2 - Web**
```bash
cd web
cp .env.example .env.local
# Edit .env.local with your Firebase config
npm run dev
```

**Terminal 3 - Mobile (Optional)**
```bash
cd mobile
cp .env.example .env
# Edit .env with your Firebase config
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Firebase configuration
│   ├── middleware/      # Auth, error handling
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic (email, etc)
│   └── index.js         # Entry point
├── .env.example
└── package.json

web/
├── src/
│   ├── config/          # Firebase config
│   ├── store/           # Zustand stores
│   ├── pages/           # Page components
│   ├── components/      # Reusable components
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json

mobile/
├── config/              # Firebase config
├── store/               # Zustand stores
├── screens/             # Screen components
├── App.js
├── app.json
└── package.json
```

## Code Style

### Backend (Node.js)
- Use async/await
- Error handling with try/catch
- Consistent naming: camelCase
- Comments for complex logic

### Frontend (React)
- Functional components with hooks
- Use Zustand for state management
- Tailwind CSS for styling
- Consistent component structure

### Mobile (React Native)
- Functional components
- Zustand for state management
- Platform-specific code in separate files
- Test on both iOS and Android

## Adding New Features

### 1. Backend API Endpoint
```javascript
// routes/newFeature.js
const express = require('express');
const { getDb } = require('../config/firebase');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireRole(['Manager']), async (req, res) => {
  try {
    // Implementation
    res.status(201).json({ message: 'Success' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 2. Web Component
```javascript
// pages/NewFeature.jsx
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';

const NewFeaturePage = () => {
  const { token } = useAuthStore();
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get('/api/newFeature', { headers });
      setData(res.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};

export default NewFeaturePage;
```

### 3. Update Firestore Rules
```
match /organizations/{orgId}/newCollection/{docId} {
  allow read: if isAuthenticated() && getUserOrgId() == orgId;
  allow write: if isAuthenticated() && isManager() && getUserOrgId() == orgId;
}
```

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Web Tests
```bash
cd web
npm test
```

### Manual Testing Checklist
- [ ] User signup
- [ ] User login
- [ ] Create order
- [ ] Update order status
- [ ] Create menu item
- [ ] Create table
- [ ] Invite employee
- [ ] Create shift
- [ ] Request shift trade

## Debugging

### Backend
```javascript
// Add console logs
console.log('Debug info:', variable);

// Use debugger
debugger;
```

### Web
- Use React DevTools browser extension
- Use Redux DevTools for state debugging
- Check Network tab for API calls

### Mobile
- Use Expo DevTools
- Use React Native Debugger
- Check console logs

## Common Issues

### Firebase Connection
- Check credentials in .env
- Verify Firebase project exists
- Check Firestore rules

### CORS Issues
- Verify CORS configuration in backend
- Check frontend URL in backend .env

### Authentication Errors
- Verify JWT secret matches
- Check token expiration
- Verify Firebase credentials

## Performance Tips

1. **Database**: Use indexes for frequently queried fields
2. **API**: Implement pagination for large datasets
3. **Frontend**: Use React.memo for expensive components
4. **Mobile**: Optimize images and bundle size

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [React Native Documentation](https://reactnative.dev)
- [Express.js Documentation](https://expressjs.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)

