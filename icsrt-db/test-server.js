const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const JWT_SECRET = "your-secret-key-change-in-production";

// In-memory storage for testing
const admins = [
  { 
    id: 1, 
    username: 'superadmin@icsrt.com', 
    password: '$2a$10$YourHashedPasswordHere', // ICSRT@2025!
    role: 'superadmin',
    name: 'Super Admin',
    createdAt: new Date().toISOString()
  },
  { 
    id: 2, 
    username: 'admin@icsrt.com', 
    password: '$2a$10$YourHashedPasswordHere2', // admin123
    role: 'admin',
    name: 'Regular Admin',
    createdAt: new Date().toISOString()
  },
  { 
    id: 3, 
    username: 'content@icsrt.com', 
    password: '$2a$10$YourHashedPasswordHere3', // content123
    role: 'admin',
    name: 'Content Manager',
    customRole: 'content-manager',
    createdAt: new Date().toISOString()
  },
  { 
    id: 4, 
    username: 'event@icsrt.com', 
    password: '$2a$10$YourHashedPasswordHere4', // event123
    role: 'admin',
    name: 'Event Manager',
    customRole: 'event-manager',
    createdAt: new Date().toISOString()
  },
  // Additional test users from screenshots
  { 
    id: 5, 
    username: 'newadmin', 
    password: '$2a$10$YourHashedPasswordHere5', // test123
    role: 'admin',
    name: 'New Admin',
    customRole: 'lessadmin',
    createdAt: new Date().toISOString()
  },
  { 
    id: 6, 
    username: 'lessadmin', 
    password: '$2a$10$YourHashedPasswordHere6', // test123
    role: 'admin',
    name: 'Less Admin',
    customRole: 'testadmin',
    createdAt: new Date().toISOString()
  },
  { 
    id: 7, 
    username: 'newtestadmin', 
    password: '$2a$10$YourHashedPasswordHere7', // test123
    role: 'admin',
    name: 'New Test Admin',
    customRole: 'newtestadmin',
    createdAt: new Date().toISOString()
  }
];

const roles = [
  {
    id: 'content-manager',
    name: 'content-manager',
    displayName: 'Content Manager',
    description: 'Can manage content but not users or roles',
    permissions: [
      'dashboard.view',
      'papers.view', 'papers.edit',
      'news.view', 'news.edit',
      'journals.view', 'journals.edit',
      'speakers.view', 'speakers.edit',
      'events.view', 'events.edit',
      'gallery.view', 'gallery.edit'
    ]
  },
  {
    id: 'event-manager',
    name: 'event-manager',
    displayName: 'Event Manager',
    description: 'Can manage events and conferences',
    permissions: [
      'dashboard.view',
      'events.view', 'events.edit',
      'conferences.view', 'conferences.edit',
      'speakers.view', 'speakers.edit',
      'registrations.view'
    ]
  },
  // Additional roles from screenshots
  {
    id: 'lessadmin',
    name: 'lessadmin',
    displayName: 'Less Admin',
    description: 'can\'t see administration',
    permissions: [
      'dashboard.view',
      'papers.view', 'papers.edit',
      'news.view', 'news.edit',
      'journals.view', 'journals.edit',
      'speakers.view', 'speakers.edit',
      'events.view', 'events.edit',
      'conferences.view', 'conferences.edit',
      'registrations.view', 'registrations.edit',
      'services.view', 'services.edit',
      'contacts.view', 'contacts.edit',
      'faq.view', 'faq.edit',
      'about.view', 'about.edit',
      'vision.view', 'vision.edit'
    ]
  },
  {
    id: 'testadmin',
    name: 'testadmin',
    displayName: 'Test Admin',
    description: 'can\'t see journals and the below',
    permissions: [
      'dashboard.view',
      'papers.view', 'papers.edit',
      'news.view', 'news.edit',
      'speakers.view', 'speakers.edit',
      'events.view', 'events.edit',
      'conferences.view', 'conferences.edit',
      'registrations.view', 'registrations.edit',
      'services.view', 'services.edit'
    ]
  },
  {
    id: 'newtestadmin',
    name: 'newtestadmin',
    displayName: 'New Test Admin',
    description: 'testadmin',
    permissions: [
      'dashboard.view',
      'registrations.view', 'registrations.edit',
      'services.view', 'services.edit'
    ]
  }
];

// Hash passwords on startup
(async () => {
  admins[0].password = await bcrypt.hash('ICSRT@2025!', 10);
  admins[1].password = await bcrypt.hash('admin123', 10);
  admins[2].password = await bcrypt.hash('content123', 10);
  admins[3].password = await bcrypt.hash('event123', 10);
  admins[4].password = await bcrypt.hash('test123', 10);
  admins[5].password = await bcrypt.hash('test123', 10);
  admins[6].password = await bcrypt.hash('test123', 10);
})();

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Permission check middleware
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      console.log('\n=== PERMISSION MIDDLEWARE CHECK ===');
      console.log('Required permission:', requiredPermission);
      console.log('Token user data:', req.user);
      
      const admin = admins.find(a => a.id === req.user.id);
      if (!admin) {
        console.log('❌ Admin not found for ID:', req.user.id);
        return res.status(404).json({ error: 'Admin not found' });
      }

      console.log('Found admin:', {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        customRole: admin.customRole
      });

      let permissions = [];

      // Only true superadmins (without custom roles) get all permissions
      if (admin.role === 'superadmin' && !admin.customRole) {
        // Grant all permissions to true superadmins
        console.log('✅ GRANTING ALL PERMISSIONS - True superadmin:', admin.username);
        console.log('=====================================');
        return next();
      } else if (admin.customRole) {
        // Get permissions from custom role
        const role = roles.find(r => r.id === admin.customRole);
        permissions = role ? role.permissions : [];
        console.log('🎭 CUSTOM ROLE PERMISSIONS for', admin.username);
        console.log('Custom role:', admin.customRole);
        console.log('Role found:', !!role);
        console.log('Permissions:', permissions);
      } else {
        // Default admin permissions (view-only for most things)
        permissions = [
          'dashboard.view', 'registrations.view',
          'services.view', 'conferences.view', 'speakers.view',
          'papers.view', 'journals.view', 'contacts.view',
          'events.view', 'news.view', 'faq.view', 'about.view',
          'vision.view', 'users.view', 'gallery.view'
        ];
        console.log('📋 DEFAULT ADMIN PERMISSIONS for', admin.username);
        console.log('Permissions:', permissions);
      }

      if (!permissions.includes(requiredPermission)) {
        console.log('❌ ACCESS DENIED for', admin.username);
        console.log('Required:', requiredPermission);
        console.log('Has:', permissions);
        console.log('=====================================');
        return res.status(403).json({ 
          error: 'Access denied. You do not have permission to perform this action.',
          requiredPermission,
          userPermissions: permissions
        });
      }

      console.log('✅ PERMISSION GRANTED for', admin.username);
      console.log('Required:', requiredPermission);
      console.log('=====================================');
      next();
    } catch (err) {
      console.error('Permission check error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    totalAdmins: admins.length,
    totalRoles: roles.length
  });
});

// Authentication endpoints
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const admin = admins.find(a => a.username === username);
    if (!admin) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: admin.id, 
        username: admin.username, 
        role: admin.role,
        customRole: admin.customRole,  // CRITICAL FIX: Include customRole in token
        name: admin.name
      }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.json({ 
      token, 
      role: admin.role,
      customRole: admin.customRole,
      name: admin.name
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/my-permissions', authenticateToken, async (req, res) => {
  try {
    const admin = admins.find(a => a.id === req.user.id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    console.log('=== PERMISSION REQUEST ===');
    console.log('Admin found:', {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      customRole: admin.customRole
    });

    let permissions = [];

    if (admin.role === 'superadmin' && !admin.customRole) {
      // Only true superadmins (without custom roles) get all permissions
      permissions = [
        'dashboard.view', 'registrations.view', 'registrations.edit', 
        'services.view', 'services.edit', 'conferences.view', 'conferences.edit',
        'speakers.view', 'speakers.edit', 'papers.view', 'papers.edit',
        'journals.view', 'journals.edit', 'contacts.view', 'contacts.edit',
        'events.view', 'events.edit', 'news.view', 'news.edit',
        'faq.view', 'faq.edit', 'about.view', 'about.edit',
        'vision.view', 'vision.edit', 'users.view', 'users.edit',
        'roles.manage', 'admins.manage', 'gallery.view', 'gallery.edit'
      ];
      console.log('✅ Super Admin permissions granted (count):', permissions.length);
    } else if (admin.customRole) {
      // Get permissions from custom role
      const role = roles.find(r => r.id === admin.customRole);
      if (role) {
        permissions = role.permissions;
        console.log('✅ Custom role found:', role.name);
        console.log('✅ Custom role permissions (count):', permissions.length);
        console.log('✅ Permissions list:', permissions);
      } else {
        console.log('❌ Custom role NOT found:', admin.customRole);
        console.log('❌ Available roles:', roles.map(r => r.id));
      }
    } else {
      // Default admin permissions
      permissions = [
        'dashboard.view', 'registrations.view',
        'services.view', 'conferences.view', 'speakers.view',
        'papers.view', 'journals.view', 'contacts.view',
        'events.view', 'news.view', 'faq.view', 'about.view',
        'vision.view', 'users.view', 'gallery.view'
      ];
      console.log('✅ Default admin permissions (count):', permissions.length);
    }

    console.log('=== FINAL RESULT ===');
    console.log('Final permissions for', admin.username, ':', permissions);
    console.log('Has dashboard.view:', permissions.includes('dashboard.view'));
    console.log('========================');

    res.json({ 
      permissions, 
      role: admin.role, 
      customRole: admin.customRole,
      name: admin.name
    });
  } catch (err) {
    console.error('Error fetching permissions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Debug endpoint to show all admin data
app.get('/api/admin/debug-all-admins', authenticateToken, (req, res) => {
  const currentAdmin = admins.find(a => a.id === req.user.id);
  if (!currentAdmin || !(currentAdmin.role === 'superadmin' && !currentAdmin.customRole)) {
    return res.status(403).json({ error: 'Access denied - Super Admin required' });
  }
  
  const debugData = admins.map(admin => ({
    id: admin.id,
    username: admin.username,
    role: admin.role,
    customRole: admin.customRole,
    name: admin.name,
    isTrueSuperAdmin: admin.role === 'superadmin' && !admin.customRole
  }));
  
  res.json(debugData);
});

// Role management endpoints (superadmin only)
app.get('/api/admin/roles', authenticateToken, checkPermission('roles.manage'), (req, res) => {
  res.json(roles);
});

app.post('/api/admin/roles', authenticateToken, checkPermission('roles.manage'), (req, res) => {
  const { name, description, permissions } = req.body;
  
  if (!name || !permissions) {
    return res.status(400).json({ error: 'Name and permissions are required' });
  }

  const existingRole = roles.find(r => r.name === name.toLowerCase());
  if (existingRole) {
    return res.status(400).json({ error: 'Role name already exists' });
  }

  const newRole = {
    id: name.toLowerCase(),
    name: name.toLowerCase(),
    displayName: name,
    description: description || '',
    permissions,
    createdBy: req.user.username,
    createdAt: new Date().toISOString()
  };

  roles.push(newRole);
  res.json({ message: 'Role created successfully', roleId: newRole.id });
});

app.get('/api/admin/admins', authenticateToken, checkPermission('admins.manage'), (req, res) => {
  const safeAdmins = admins.map(admin => ({
    ...admin,
    password: undefined
  }));
  res.json(safeAdmins);
});

app.put('/api/admin/admins/:id/assign-role', authenticateToken, checkPermission('admins.manage'), (req, res) => {
  const { id } = req.params;
  const { roleId, role } = req.body;
  
  const admin = admins.find(a => a.id === parseInt(id));
  if (!admin) {
    return res.status(404).json({ error: 'Admin not found' });
  }

  if (roleId) {
    const roleExists = roles.find(r => r.id === roleId);
    if (!roleExists) {
      return res.status(404).json({ error: 'Role not found' });
    }
    admin.customRole = roleId;
    admin.role = 'admin'; // Keep base role as admin
  } else if (role) {
    if (!['admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    admin.role = role;
    delete admin.customRole;
  }

  admin.updatedAt = new Date().toISOString();
  res.json({ message: 'Role assigned successfully' });
});

// Protected endpoints with permission checks
app.get('/api/papers', authenticateToken, checkPermission('papers.view'), (req, res) => {
  res.json([
    { id: 1, title: 'Sample Paper 1', author: 'John Doe', status: 'published' },
    { id: 2, title: 'Sample Paper 2', author: 'Jane Smith', status: 'draft' }
  ]);
});

app.post('/api/papers', authenticateToken, checkPermission('papers.edit'), (req, res) => {
  const { title, author, content } = req.body;
  const newPaper = {
    id: Date.now(),
    title,
    author,
    content,
    createdBy: req.user.username,
    createdAt: new Date().toISOString()
  };
  res.json({ message: 'Paper created successfully', paper: newPaper });
});

app.put('/api/papers/:id', authenticateToken, checkPermission('papers.edit'), (req, res) => {
  const { id } = req.params;
  const { title, author, content } = req.body;
  
  res.json({ 
    message: 'Paper updated successfully', 
    paper: { id, title, author, content, updatedAt: new Date().toISOString() }
  });
});

app.delete('/api/papers/:id', authenticateToken, checkPermission('papers.edit'), (req, res) => {
  const { id } = req.params;
  res.json({ message: 'Paper deleted successfully' });
});

app.get('/api/news', authenticateToken, checkPermission('news.view'), (req, res) => {
  res.json([
    { id: 1, title: 'Sample News 1', content: 'News content', status: 'published' },
    { id: 2, title: 'Sample News 2', content: 'News content', status: 'draft' }
  ]);
});

app.post('/api/news', authenticateToken, checkPermission('news.edit'), (req, res) => {
  const { title, content } = req.body;
  const newNews = {
    id: Date.now(),
    title,
    content,
    createdBy: req.user.username,
    createdAt: new Date().toISOString()
  };
  res.json({ message: 'News created successfully', news: newNews });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Dashboard stats endpoint
app.get('/api/dashboard-stats', authenticateToken, checkPermission('dashboard.view'), (req, res) => {
  res.json({
    visitors: 100,
    users: 50,
    registrations: 25,
    conferences: 5,
    services: 10,
    serviceOrders: 15,
    papers: 20,
    journals: 8,
    speakers: 12,
    events: 6,
    news: 18,
    faq: 10,
    testimonials: 7,
    contacts: 30,
    gallery: 45,
    pending: {
      registrations: 5,
      users: 3,
      serviceOrders: 2
    },
    recent: {
      registrations: 10,
      users: 8,
      serviceOrders: 5
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 Test Server is running on http://localhost:${port}`);
  console.log(`📊 Dashboard stats available at: http://localhost:${port}/api/dashboard-stats`);
  console.log(`🔐 Login endpoint: http://localhost:${port}/api/admin/login`);
  console.log(`\nTest accounts:`);
  console.log(`Super Admin: superadmin@icsrt.com / ICSRT@2025!`);
  console.log(`Regular Admin: admin@icsrt.com / admin123`);
  console.log(`Content Manager: content@icsrt.com / content123`);
  console.log(`Event Manager: event@icsrt.com / event123`);
  console.log(`New Admin: newadmin / test123`);
  console.log(`Less Admin: lessadmin / test123`);
  console.log(`New Test Admin: newtestadmin / test123`);
});
