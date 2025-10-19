# Deployment Guide

## Prerequisites
- Firebase project set up
- Vercel account (for web frontend)
- Render or AWS account (for backend)
- Expo account (for mobile)

## Firebase Setup

### 1. Create Firebase Project
1. Go to https://console.firebase.google.com
2. Create a new project
3. Enable Firestore Database
4. Enable Authentication (Email/Password)
5. Create a service account:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely

### 2. Deploy Firestore Rules
```bash
npm install -g firebase-tools
firebase login
firebase init
# Select your project
firebase deploy --only firestore:rules
```

## Backend Deployment (Render)

### 1. Prepare Backend
```bash
cd backend
npm install
```

### 2. Create Render Service
1. Go to https://render.com
2. Create new Web Service
3. Connect your GitHub repository
4. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables:
     - FIREBASE_PROJECT_ID
     - FIREBASE_PRIVATE_KEY
     - FIREBASE_CLIENT_EMAIL
     - JWT_SECRET
     - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
     - SMTP_FROM

### 3. Deploy
- Push to main branch
- Render automatically deploys

## Web Frontend Deployment (Vercel)

### 1. Prepare Web App
```bash
cd web
npm install
npm run build
```

### 2. Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### 3. Configure Environment Variables
In Vercel dashboard:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_API_URL (your Render backend URL)

## Mobile Deployment (Expo)

### 1. Create Expo Account
- Go to https://expo.dev
- Sign up and create account

### 2. Build for iOS
```bash
cd mobile
eas build --platform ios
```

### 3. Build for Android
```bash
cd mobile
eas build --platform android
```

### 4. Submit to App Stores
```bash
# iOS
eas submit --platform ios

# Android
eas submit --platform android
```

## Environment Variables Checklist

### Backend (.env)
- [ ] FIREBASE_PROJECT_ID
- [ ] FIREBASE_PRIVATE_KEY
- [ ] FIREBASE_CLIENT_EMAIL
- [ ] PORT
- [ ] NODE_ENV
- [ ] JWT_SECRET
- [ ] SMTP_HOST
- [ ] SMTP_PORT
- [ ] SMTP_USER
- [ ] SMTP_PASS
- [ ] SMTP_FROM
- [ ] WEB_URL
- [ ] MOBILE_URL

### Web (.env.local)
- [ ] VITE_FIREBASE_API_KEY
- [ ] VITE_FIREBASE_AUTH_DOMAIN
- [ ] VITE_FIREBASE_PROJECT_ID
- [ ] VITE_FIREBASE_STORAGE_BUCKET
- [ ] VITE_FIREBASE_MESSAGING_SENDER_ID
- [ ] VITE_FIREBASE_APP_ID
- [ ] VITE_API_URL

### Mobile (.env)
- [ ] EXPO_PUBLIC_FIREBASE_API_KEY
- [ ] EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
- [ ] EXPO_PUBLIC_FIREBASE_PROJECT_ID
- [ ] EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
- [ ] EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- [ ] EXPO_PUBLIC_FIREBASE_APP_ID
- [ ] EXPO_PUBLIC_API_URL

## Post-Deployment

### 1. Test All Features
- [ ] User signup and login
- [ ] Order creation
- [ ] Kitchen screen updates
- [ ] Shift management
- [ ] Email notifications

### 2. Monitor
- Set up error tracking (Sentry)
- Monitor API performance
- Check Firebase usage

### 3. Backup
- Enable Firebase backups
- Set up database snapshots

## Troubleshooting

### Backend Issues
- Check Firebase credentials
- Verify CORS settings
- Check rate limiting

### Web Issues
- Clear browser cache
- Check Firebase config
- Verify API URL

### Mobile Issues
- Check Expo credentials
- Verify environment variables
- Test on physical device

## Scaling Considerations

1. **Database**: Monitor Firestore usage, consider sharding
2. **Backend**: Use auto-scaling on Render/AWS
3. **Frontend**: Use CDN for static assets
4. **Email**: Consider SendGrid for higher volume
5. **Analytics**: Implement proper logging

## Security Checklist

- [ ] Enable HTTPS everywhere
- [ ] Set up firewall rules
- [ ] Enable 2FA on all accounts
- [ ] Rotate secrets regularly
- [ ] Monitor access logs
- [ ] Set up alerts for unusual activity

