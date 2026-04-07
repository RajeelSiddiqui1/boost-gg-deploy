# Local File Storage Setup

## Overview
This project uses **local disk storage** with Multer instead of cloud storage (Cloudinary). Images are stored in the `server/uploads/games` directory.

## Directory Structure
```
server/
├── uploads/
│   └── games/           # Game images stored here
│       ├── wow-123456.jpg
│       ├── destiny-789012.png
│       └── ...
```

## How It Works

### 1. Image Upload
- Images are uploaded via multipart/form-data
- Multer saves files to `server/uploads/games/`
- Unique filenames are generated: `originalname-timestamp-random.ext`

### 2. File Access
- Files are served statically via Express
- URL format: `http://localhost:5000/uploads/games/filename.jpg`
- Frontend accesses images using these URLs

### 3. File Management
- **Create**: Files saved during game creation
- **Update**: Old files deleted, new files saved
- **Delete**: Files kept (soft delete), can be cleaned up manually

## Configuration

### Multer Settings
```javascript
{
  destination: 'server/uploads/games',
  fileSize: 5MB max,
  allowedTypes: ['jpeg', 'jpg', 'png', 'webp', 'gif']
}
```

### Static File Serving
```javascript
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

## Advantages vs Cloudinary

✅ **No API Keys Required** - No external service setup  
✅ **Faster Development** - No network latency  
✅ **Free** - No usage limits or costs  
✅ **Simple** - Direct file system access  
✅ **Privacy** - Data stays on your server  

## Disadvantages

❌ **No CDN** - Slower for global users  
❌ **No Auto-Optimization** - Manual image processing needed  
❌ **Storage Limits** - Limited by server disk space  
❌ **Backup Required** - Must backup uploads directory  
❌ **Scaling** - Harder to scale across multiple servers  

## Production Considerations

### For Production Deployment:

1. **Backup Strategy**
   ```bash
   # Regular backups of uploads directory
   tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/
   ```

2. **Nginx Configuration** (if using Nginx)
   ```nginx
   location /uploads {
       alias /path/to/server/uploads;
       expires 30d;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **Environment Variables**
   ```env
   # In .env file
   UPLOAD_DIR=./uploads/games
   MAX_FILE_SIZE=5242880  # 5MB in bytes
   ```

4. **Storage Monitoring**
   - Monitor disk space usage
   - Set up alerts for low disk space
   - Implement cleanup for old/unused files

## File Cleanup

### Manual Cleanup
```bash
# Find files older than 30 days
find server/uploads/games -type f -mtime +30

# Delete files older than 30 days (be careful!)
find server/uploads/games -type f -mtime +30 -delete
```

### Automated Cleanup Script
Create `server/scripts/cleanupOldFiles.js`:
```javascript
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../uploads/games');
const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

fs.readdir(uploadDir, (err, files) => {
    if (err) throw err;
    
    files.forEach(file => {
        const filePath = path.join(uploadDir, file);
        fs.stat(filePath, (err, stats) => {
            if (err) throw err;
            
            if (Date.now() - stats.mtime.getTime() > maxAge) {
                fs.unlink(filePath, err => {
                    if (err) throw err;
                    console.log(`Deleted: ${file}`);
                });
            }
        });
    });
});
```

## Troubleshooting

### Images Not Loading
1. Check if `uploads/games` directory exists
2. Verify file permissions (readable by Node.js process)
3. Check static file middleware is configured
4. Verify file path in database matches actual file

### Upload Fails
1. Check disk space availability
2. Verify write permissions on `uploads/games`
3. Check file size is under 5MB
4. Verify file type is allowed

### Performance Issues
1. Enable Nginx/Apache for static file serving
2. Add caching headers
3. Compress images before upload
4. Consider CDN for production

## Migration from Cloudinary

If you previously used Cloudinary:

1. **Download Existing Images**
   ```javascript
   // Script to download from Cloudinary
   const cloudinary = require('cloudinary').v2;
   // Download and save to local uploads directory
   ```

2. **Update Database URLs**
   ```javascript
   // Update all game image URLs
   db.games.updateMany(
     {},
     { $set: { 
       bgImage: { $concat: ["/uploads/games/", "$bgImage"] }
     }}
   );
   ```

3. **Remove Cloudinary Dependencies**
   ```bash
   npm uninstall cloudinary multer-storage-cloudinary
   ```

## Best Practices

1. **Image Optimization**
   - Use tools like `sharp` to resize/compress images
   - Generate thumbnails for faster loading
   - Convert to WebP format for better compression

2. **Security**
   - Validate file types strictly
   - Scan uploads for malware
   - Limit file sizes
   - Use unique, unpredictable filenames

3. **Organization**
   - Keep uploads directory outside public web root
   - Use subdirectories for different image types
   - Implement naming conventions

4. **Monitoring**
   - Track upload success/failure rates
   - Monitor disk usage
   - Log file operations
