# Social Media Management System

A comprehensive social media links management system for the ICSRT project that allows administrators to manage social media links from the dashboard and display them dynamically in the userpage footer.

## 🌟 Features

### Dashboard (Admin Panel)
- **Complete CRUD Operations**: Create, Read, Update, Delete social media links
- **Visual Management**: Intuitive interface with platform icons and colors
- **Drag & Drop Ordering**: Reorder links with visual feedback
- **Enable/Disable Toggle**: Show/hide links without deleting them
- **URL Validation**: Automatic validation of social media URLs
- **Platform Detection**: Auto-detection of platform icons and labels
- **Bulk Operations**: Reorder multiple links at once

### User Page Integration
- **Dynamic Display**: Automatically fetches and displays active social links
- **Responsive Design**: Looks great on all devices
- **Platform Icons**: Beautiful Font Awesome icons for each platform
- **Hover Effects**: Smooth animations and transitions
- **Accessibility**: Screen reader friendly with proper ARIA labels

### Backend API
- **RESTful Endpoints**: Full REST API for social media management
- **Data Validation**: Server-side validation for all inputs
- **Error Handling**: Comprehensive error handling and logging
- **MongoDB Integration**: Efficient database operations with indexes

## 🚀 API Endpoints

### Get All Social Links
```
GET /api/social-links
```
Returns all social media links sorted by order and creation date.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "platform": "facebook",
      "url": "https://facebook.com/icsrt",
      "icon": "fab fa-facebook",
      "label": "Facebook",
      "enabled": true,
      "order": 1,
      "createdAt": "2025-07-24T...",
      "updatedAt": "2025-07-24T..."
    }
  ]
}
```

### Get Single Social Link
```
GET /api/social-links/:id
```

### Create New Social Link
```
POST /api/social-links
```

**Body:**
```json
{
  "platform": "instagram",
  "url": "https://instagram.com/icsrt",
  "label": "Instagram",
  "enabled": true,
  "order": 2
}
```

### Update Social Link
```
PUT /api/social-links/:id
```

### Delete Social Link
```
DELETE /api/social-links/:id
```

### Bulk Reorder Links
```
PUT /api/social-links/reorder
```

**Body:**
```json
{
  "links": [
    { "_id": "...", "order": 1 },
    { "_id": "...", "order": 2 }
  ]
}
```

## 🎨 Supported Platforms

The system includes built-in support for popular social media platforms:

- **Facebook** - fab fa-facebook (Blue)
- **Twitter** - fab fa-twitter (Blue)
- **Instagram** - fab fa-instagram (Pink)
- **LinkedIn** - fab fa-linkedin (Blue)
- **YouTube** - fab fa-youtube (Red)
- **TikTok** - fab fa-tiktok (Black)
- **WhatsApp** - fab fa-whatsapp (Green)
- **Telegram** - fab fa-telegram (Blue)
- **Discord** - fab fa-discord (Indigo)
- **Snapchat** - fab fa-snapchat (Yellow)
- **Pinterest** - fab fa-pinterest (Red)
- **GitHub** - fab fa-github (Gray)
- **Website** - fas fa-globe (Gray)
- **Custom** - fas fa-link (Gray)

## 📁 File Structure

```
icsrt-db/
├── server.js                          # Main server with social media API endpoints
├── setup-default-social-links.js      # Script to create default social links
├── test-social-media-api.js           # API testing script
└── setup-social-media-system.ps1      # Complete system setup script

icsrt-dashboard/
├── src/
│   ├── App.jsx                        # Updated with social media route
│   ├── Sidebar.jsx                    # Updated with social media menu item
│   └── pages/
│       └── SocialMediaManagement.jsx  # Main dashboard component

icsrt-userpage/
└── src/
    └── components/
        └── FollowUs.jsx               # Updated to fetch and display social links
```

## 🛠️ Setup Instructions

### 1. Quick Setup (Recommended)
```powershell
cd icsrt-db
./setup-social-media-system.ps1
```

### 2. Manual Setup

#### Start the Database Server
```bash
cd icsrt-db
node server.js
```

#### Create Default Social Links (Optional)
```bash
node setup-default-social-links.js
```

#### Test API Endpoints
```bash
node test-social-media-api.js
```

#### Start Dashboard
```bash
cd icsrt-dashboard
npm start
```

#### Start User Page
```bash
cd icsrt-userpage
npm start
```

## 🎯 Usage Guide

### For Administrators

1. **Access Dashboard**: Navigate to `http://localhost:3001`
2. **Login**: Use your admin credentials
3. **Open Social Media**: Click "Social Media" in the sidebar
4. **Add Links**: Click "Add Social Link" button
5. **Fill Details**:
   - Select platform from dropdown
   - Enter the social media URL
   - Customize label if needed
   - Set display order
   - Enable/disable as needed
6. **Save**: Click "Create Link"

### Managing Existing Links

- **Edit**: Click "Edit" button next to any link
- **Delete**: Click "Delete" button (requires confirmation)
- **Toggle**: Click the status badge to enable/disable
- **Reorder**: Use the order field in edit mode

### For Users

Social media links automatically appear in the footer section of the user page at `http://localhost:3002`. The links are:

- **Dynamically loaded** from the database
- **Only show enabled links**
- **Sorted by order** as set in dashboard
- **Clickable** and open in new tabs
- **Responsive** on all devices

## 🔧 Customization

### Adding New Platforms

To add support for a new social media platform:

1. **Update Dashboard Component** (`SocialMediaManagement.jsx`):
```javascript
const platformIcons = {
  // ... existing platforms
  newplatform: { icon: FaNewIcon, color: 'text-platform-color', default: 'fab fa-newplatform' }
};
```

2. **Update User Component** (`FollowUs.jsx`):
```javascript
const platformIcons = {
  // ... existing platforms
  newplatform: { icon: FaNewIcon, color: 'hover:text-platform-color' }
};
```

### Styling Customization

The components use Tailwind CSS classes. You can customize:
- **Colors**: Update the color classes in platform definitions
- **Layout**: Modify the component JSX structure
- **Animations**: Adjust transition and hover effects
- **Spacing**: Change padding, margins, and grid layouts

## 🚨 Troubleshooting

### Common Issues

1. **Server Not Starting**
   - Check if port 3000 is available
   - Verify MongoDB connection string
   - Check for syntax errors in server.js

2. **Links Not Appearing**
   - Verify links are enabled in dashboard
   - Check browser console for API errors
   - Ensure userpage is fetching from correct API URL

3. **CORS Errors**
   - Verify CORS configuration in server.js
   - Check if all origins are properly allowed
   - Restart server after CORS changes

4. **Database Connection Issues**
   - Verify MongoDB Atlas credentials
   - Check internet connectivity
   - Confirm database name and collection exist

### Debug Mode

Enable debug logging by adding to server.js:
```javascript
app.use((req, res, next) => {
  if (req.path.includes('/social-links')) {
    console.log(`[SOCIAL-API] ${req.method} ${req.path}`, req.body);
  }
  next();
});
```

## 📊 Database Schema

### social_links Collection

```javascript
{
  _id: ObjectId,           // MongoDB document ID
  platform: String,       // Platform identifier (lowercase)
  url: String,            // Social media profile URL
  icon: String,           // Font Awesome icon class
  label: String,          // Display label
  enabled: Boolean,       // Visibility flag
  order: Number,          // Display order
  createdAt: String,      // ISO date string
  updatedAt: String,      // ISO date string
  createdBy: String,      // Creator identifier
  updatedBy: String       // Last updater identifier (optional)
}
```

### Indexes
The system automatically creates indexes for optimal performance:
- `order` (ascending)
- `createdAt` (ascending)
- `enabled` (descending)

## 🤝 Contributing

When contributing to the social media management system:

1. **Follow existing patterns** for consistency
2. **Test all API endpoints** before submitting
3. **Update this README** if adding new features
4. **Ensure responsive design** for new UI components
5. **Validate inputs** both client and server side

## 📄 License

This social media management system is part of the ICSRT project and follows the same licensing terms.

---

## 🎉 Success!

Your social media management system is now ready! Administrators can easily manage social media links through the dashboard, and users will see them beautifully displayed in the website footer.

**Next Steps:**
1. Update the default social media URLs with your actual profiles
2. Customize the styling to match your brand
3. Add any additional platforms you need
4. Test the system across different devices and browsers

Happy social media managing! 🚀
