# Environment Variables for BoostGG

## Backend (.env in /server)

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# File Upload (Local Storage)
UPLOAD_DIR=./uploads/games
MAX_FILE_SIZE=5242880  # 5MB in bytes

# Email (if using)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_email_password
FROM_EMAIL=noreply@boostgg.com
FROM_NAME=BoostGG

# Logging
LOG_LEVEL=info
```
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_email_password
FROM_EMAIL=noreply@boostgg.com
FROM_NAME=BoostGG

# Logging
LOG_LEVEL=info
```

## Frontend (.env in /client)

```env
# API URL
REACT_APP_API_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000
```

## Setup Instructions

1. **Backend Setup:**
   - Copy `.env.example` to `.env` in the `/server` directory
   - Fill in all required values
   - **No external service setup needed** - images stored locally

2. **Frontend Setup:**
   - Copy `.env.example` to `.env` in the `/client` directory
   - Update API URL if different from localhost

3. **File Upload Setup:**
   - Uploads directory is created automatically
   - Images saved to `server/uploads/games/`
   - Served via `/uploads/games/` URL path

## Important Notes

- Never commit `.env` files to version control
- Keep `.env.example` files updated with new variables (without values)
- Use strong, unique values for JWT_SECRET
- In production, use environment-specific values
- **Backup `uploads/` directory regularly** - contains all uploaded images

