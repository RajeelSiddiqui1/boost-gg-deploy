# Admin User Creation Guide

## Method 1: Using Script (Recommended)

### Step 1: Create Admin User
```bash
cd server
node scripts/seedAdmin.js
```

This will create an admin user with:
- **Email**: `admin@boostgg.com`
- **Password**: `Admin@123456`
- **Role**: `admin`

### Step 2: Login
1. Go to login page
2. Use the credentials above
3. **IMPORTANT**: Change password after first login!

### Step 3: Customize (Optional)
Edit `createAdmin.js` before running to change:
- Name
- Email
- Password

---

## Method 2: Using MongoDB Compass/Shell

### Option A: MongoDB Compass
1. Open MongoDB Compass
2. Connect to your database
3. Go to `users` collection
4. Find your user
5. Edit the document:
   ```json
   {
     "role": "admin"
   }
   ```
6. Save changes

### Option B: MongoDB Shell
```bash
mongosh

use boostgg

db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

---

## Method 3: Register Then Promote

### Step 1: Register Normal User
1. Go to signup page
2. Register with your email
3. Complete registration

### Step 2: Promote to Admin
```bash
cd server
node
```

Then in Node REPL:
```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOneAndUpdate(
    { email: 'your-email@example.com' },
    { role: 'admin', isVerified: true },
    { new: true }
  );
  console.log('Admin created:', user.email, user.role);
  process.exit(0);
});
```

---

## Verify Admin Access

After creating admin:

1. **Login** with admin credentials
2. **Check Dashboard** - You should see admin-only sections
3. **Access Admin Routes**:
   - `/admin/games` - Game management
   - `/admin/users` - User management (if exists)
   - `/admin/orders` - Order management (if exists)

---

## Security Tips

⚠️ **IMPORTANT**:
- Change default password immediately
- Use strong passwords (12+ characters)
- Don't share admin credentials
- Enable 2FA if available
- Regularly audit admin actions

---

## Troubleshooting

### "Admin already exists"
- Admin user is already created
- Use existing credentials or reset password

### "MongoDB Connection Error"
- Check `.env` file has correct `MONGO_URI`
- Ensure MongoDB is running
- Verify network connection

### "Cannot find module"
- Run `npm install` in server directory
- Check all dependencies are installed

### "Role not updating"
- Clear browser cache
- Logout and login again
- Check database directly

---

## Quick Reference

**Default Admin Credentials:**
```
Email: admin@boostgg.com
Password: Admin@123456
```

**Run Script:**
```bash
cd server
node scripts/seedAdmin.js
```

**Check Admin in Database:**
```bash
mongosh
use boostgg
db.users.findOne({ role: "admin" })
```
