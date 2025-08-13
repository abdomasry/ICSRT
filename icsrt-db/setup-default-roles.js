const { MongoClient } = require("mongodb");

const MONGODB_URI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "icsrt_main";

const defaultRoles = [
  {
    name: "super_admin",
    description: "Full system access with all permissions",
    permissions: {
      "dashboard": ["view"],
      "admins": ["view", "create", "edit", "delete"],
      "users": ["view", "create", "edit", "delete"],
      "articles": ["view", "create", "edit", "delete"],
      "services": ["view", "create", "edit", "delete"],
      "events": ["view", "create", "edit", "delete"],
      "news": ["view", "create", "edit", "delete"],
      "testimonials": ["view", "create", "edit", "delete"],
      "faq": ["view", "create", "edit", "delete"],
      "contacts": ["view", "create", "edit", "delete"],
      "registrations": ["view", "create", "edit", "delete"],
      "service-orders": ["view", "edit", "delete"],
      "newsletter": ["view", "delete"],
      "about": ["view", "edit"],
      "mission": ["view", "edit"],
      "vision": ["view", "edit"],
      "roles": ["view", "create", "edit", "delete"]
    },
    createdAt: new Date().toISOString(),
    createdBy: "system"
  },
  {
    name: "content_manager",
    description: "Can manage articles, news, events, and testimonials",
    permissions: {
      "dashboard": ["view"],
      "articles": ["view", "create", "edit", "delete"],
      "news": ["view", "create", "edit", "delete"],
      "events": ["view", "create", "edit", "delete"],
      "testimonials": ["view", "create", "edit", "delete"],
      "faq": ["view", "create", "edit"]
    },
    createdAt: new Date().toISOString(),
    createdBy: "system"
  },
  {
    name: "service_manager",
    description: "Can manage services and service orders",
    permissions: {
      "dashboard": ["view"],
      "services": ["view", "create", "edit", "delete"],
      "service-orders": ["view", "edit"],
      "contacts": ["view"]
    },
    createdAt: new Date().toISOString(),
    createdBy: "system"
  },
  {
    name: "user_manager",
    description: "Can manage users and registrations",
    permissions: {
      "dashboard": ["view"],
      "users": ["view", "create", "edit", "delete"],
      "registrations": ["view", "create", "edit", "delete"],
      "newsletter": ["view"]
    },
    createdAt: new Date().toISOString(),
    createdBy: "system"
  },
  {
    name: "viewer",
    description: "Read-only access to most sections",
    permissions: {
      "dashboard": ["view"],
      "users": ["view"],
      "articles": ["view"],
      "services": ["view"],
      "events": ["view"],
      "news": ["view"],
      "testimonials": ["view"],
      "faq": ["view"],
      "contacts": ["view"],
      "registrations": ["view"],
      "service-orders": ["view"]
    },
    createdAt: new Date().toISOString(),
    createdBy: "system"
  }
];

async function setupDefaultRoles() {
  let client;
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    const rolesCollection = db.collection('roles');
    
    // Check if roles already exist
    const existingRoles = await rolesCollection.find({}).toArray();
    console.log(`📋 Found ${existingRoles.length} existing roles`);
    
    // Insert default roles if they don't exist
    for (const role of defaultRoles) {
      const exists = existingRoles.find(r => r.name === role.name);
      if (!exists) {
        await rolesCollection.insertOne(role);
        console.log(`✅ Created role: ${role.name}`);
      } else {
        console.log(`⚠️  Role already exists: ${role.name}`);
      }
    }
    
    console.log('🎉 Default roles setup completed!');
    console.log('\n📝 Available roles:');
    const allRoles = await rolesCollection.find({}).toArray();
    allRoles.forEach(role => {
      const permCount = Object.keys(role.permissions).length;
      console.log(`  - ${role.name}: ${permCount} sections, ${role.description}`);
    });
    
  } catch (error) {
    console.error('❌ Error setting up roles:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the setup
setupDefaultRoles();
