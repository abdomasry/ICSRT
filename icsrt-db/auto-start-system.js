const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { spawn, exec } = require('child_process');
const path = require('path');

const createEnhancedTestData = async (connectDB) => {
  try {
    console.log('\n🔄 Creating enhanced test data...');

    // Use the server's connectDB function
    const database = await connectDB();

    // Check if we need to create fresh test data for purchase links
    const existingTestOrder = await database.collection('service_orders').findOne({ 
      serviceName: 'E-commerce Website Development',
      userEmail: 'testuser@icsrt.com' 
    });
    
      if (existingTestOrder) {
        console.log('📊 Purchase link test data already exists, continuing to ensure other demo content...');
      }

    // Create/update admin user (force update to ensure it exists)
    const adminPassword = await bcrypt.hash('admin123', 10);
    await database.collection('users').replaceOne(
      { email: 'admin@icsrt.com' },
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@icsrt.com',
        password: adminPassword,
        role: 'admin',
        phone: '+1234567890',
        country: 'United States',
        organization: 'ICSRT',
        designation: 'System Administrator',
        createdAt: new Date(),
        isVerified: true
      },
      { upsert: true }
    );

    // Create/update test user (force update to ensure it exists)
    const userPassword = await bcrypt.hash('password123', 10);
    await database.collection('users').replaceOne(
      { email: 'testuser@icsrt.com' },
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'testuser@icsrt.com',
        password: userPassword,
        phone: '+1234567890',
        country: 'United States',
        organization: 'Tech Solutions Inc',
        designation: 'Software Engineer',
        createdAt: new Date(),
        isVerified: true
      },
      { upsert: true }
    );

    // Create/update customer user (force update to ensure it exists)
    const customerPassword = await bcrypt.hash('password123', 10);
    await database.collection('users').replaceOne(
      { email: 'customer@icsrt.com' },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'customer@icsrt.com',
        password: customerPassword,
        phone: '+1987654321',
        country: 'Canada',
        organization: 'Digital Ventures',
        designation: 'Marketing Director',
        createdAt: new Date(),
        isVerified: true
      },
      { upsert: true }
    );

    // Create service orders
    const orders = [
      {
        userEmail: 'testuser@icsrt.com',
        serviceName: 'E-commerce Website Development',
        description: 'Complete e-commerce solution with admin panel and payment integration',
        requirements: 'React.js frontend, Node.js backend, MongoDB database, Stripe payment integration, admin dashboard',
        status: 'confirmed',
        totalAmount: 2500,
        paymentStatus: 'pending',
        customerInfo: {
          name: 'John Doe',
          email: 'testuser@icsrt.com',
          phone: '+1234567890',
          country: 'United States',
          organization: 'Tech Solutions Inc',
          designation: 'Software Engineer'
        },
        messages: [
          {
            sender: 'user',
            senderInfo: 'John Doe',
            message: 'Hello, I need a complete e-commerce solution for my business.',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            channel: 'userpage'
          },
          {
            sender: 'admin',
            senderInfo: 'ICSRT Team',
            message: 'Thank you for your inquiry! We have reviewed your requirements and prepared a custom quote.',
            timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            channel: 'userpage'
          }
        ],
        lastMessageAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        userEmail: 'customer@icsrt.com',
        serviceName: 'Mobile App Development',
        description: 'Cross-platform mobile application for iOS and Android',
        requirements: 'React Native app, REST API integration, push notifications, user authentication',
        status: 'confirmed',
        totalAmount: 3500,
        paymentStatus: 'pending',
        customerInfo: {
          name: 'Jane Smith',
          email: 'customer@icsrt.com',
          phone: '+1987654321',
          country: 'Canada',
          organization: 'Digital Ventures',
          designation: 'Marketing Director'
        },
        messages: [
          {
            sender: 'user',
            senderInfo: 'Jane Smith',
            message: 'I need a mobile app for my digital marketing agency.',
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            channel: 'userpage'
          }
        ],
        lastMessageAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        userEmail: 'testuser@icsrt.com',
        serviceName: 'Digital Marketing Campaign',
        description: 'Comprehensive digital marketing strategy and implementation',
        requirements: 'SEO optimization, social media marketing, content creation, analytics setup',
        status: 'in-progress',
        totalAmount: 1200,
        paymentStatus: 'paid',
        customerInfo: {
          name: 'John Doe',
          email: 'testuser@icsrt.com',
          phone: '+1234567890',
          country: 'United States',
          organization: 'Tech Solutions Inc',
          designation: 'Software Engineer'
        },
        messages: [],
        lastMessageAt: new Date(),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ];

    // Create service orders (idempotent)
    for (const order of orders) {
      await database.collection('service_orders').replaceOne(
        { userEmail: order.userEmail, serviceName: order.serviceName },
        order,
        { upsert: true }
      );
    }

    // Create coupons
    const coupons = [
      {
        code: 'WELCOME10',
        description: 'Welcome discount - 10% off your first order',
        discountType: 'percentage',
        discountValue: 10,
        minimumAmount: 100,
        maxUses: 100,
        currentUses: 5,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: new Date()
      },
      {
        code: 'SAVE50',
        description: 'Fixed discount - $50 off orders over $200',
        discountType: 'fixed',
        discountValue: 50,
        minimumAmount: 200,
        maxUses: 50,
        currentUses: 12,
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: new Date()
      },
      {
        code: 'BIGDEAL20',
        description: 'Big deal - 20% off orders over $1000',
        discountType: 'percentage',
        discountValue: 20,
        minimumAmount: 1000,
        maxUses: 25,
        currentUses: 3,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: new Date()
      },
      {
        code: 'PREMIUM15',
        description: 'Premium service - 15% off premium packages',
        discountType: 'percentage',
        discountValue: 15,
        minimumAmount: 500,
        maxUses: 40,
        currentUses: 8,
        expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: new Date()
      }
    ];

    for (const coupon of coupons) {
      await database.collection('coupons').replaceOne(
        { code: coupon.code },
        coupon,
        { upsert: true }
      );
    }

    // Create purchase links for confirmed orders
    const confirmedOrders = await database.collection('service_orders').find({ 
      status: 'confirmed', 
      paymentStatus: 'pending' 
    }).toArray();
    
    let purchaseLinksCreated = 0;

    for (const order of confirmedOrders) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiryDate = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

      await database.collection('purchase_links').replaceOne(
        { orderId: order._id.toString() },
        {
          orderId: order._id.toString(),
          token: token,
          userEmail: order.userEmail,
          amount: order.totalAmount,
          expiryDate: expiryDate,
          isUsed: false,
          createdBy: 'admin@icsrt.com',
          createdAt: new Date()
        },
        { upsert: true }
      );
      purchaseLinksCreated++;
    }

    console.log('✅ Enhanced test data created successfully!');
    console.log(`📊 Created: ${orders.length} service orders, ${coupons.length} coupons, ${purchaseLinksCreated} purchase links`);
        // === ABOUT / MISSION / VISION SEEDING ===
        const aboutDoc = {
          key: 'about',
          title: 'About ICSRT',
          subtitle: 'International Conference on Science, Research & Technology',
          content: `ICSRT is a collaborative initiative that connects researchers, industry professionals, and academic institutions to advance science and technology. Our mission is to enable impactful research, foster innovation, and accelerate knowledge sharing across borders.\n\nWe provide research services, publication support, workshops, and community programs that empower scholars and organizations to achieve measurable results.`,
          imageUrl: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1920&auto=format&fit=crop',
          highlights: [
            'Research excellence and open collaboration',
            'Industry-academia partnerships',
            'Workshops, training, and community engagement'
          ],
          updatedAt: new Date()
        };

        const missionDoc = {
          key: 'mission',
          title: 'Our Mission',
          content: `To enable high‑quality, ethical research and accelerate technology transfer by providing practical services, mentorship, and an international platform for sharing knowledge.`,
          bullets: [
            'Support researchers with end‑to‑end services',
            'Promote ethical, reproducible, and open research',
            'Bridge gaps between academia and industry'
          ],
          imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1920&auto=format&fit=crop',
          updatedAt: new Date()
        };

        const visionDoc = {
          key: 'vision',
          title: 'Our Vision',
          content: `A connected global community where scientific research drives sustainable innovation, informed policy, and positive societal impact.`,
          bullets: [
            'Accessible research infrastructure',
            'Diverse, inclusive scientific communities',
            'Measurable impact across disciplines'
          ],
          imageUrl: 'https://images.unsplash.com/photo-1496302662116-35cc4f36df92?q=80&w=1920&auto=format&fit=crop',
          updatedAt: new Date()
        };

        await database.collection('about').replaceOne({ key: 'about' }, aboutDoc, { upsert: true });
        await database.collection('mission').replaceOne({ key: 'mission' }, missionDoc, { upsert: true });
        await database.collection('vision').replaceOne({ key: 'vision' }, visionDoc, { upsert: true });

        // === SERVICES SEEDING ===
      const services = [
          {
            slug: 'manuscript-editing',
            title: 'Academic Manuscript Editing',
            summary: 'Language polishing, structure improvement, and journal‑ready formatting.',
            description: 'Professional editing for academic manuscripts, theses, and proposals with focus on clarity, coherence, and target‑journal guidelines.',
            category: 'Editing',
            priceFrom: 149,
            currency: 'USD',
    features: 'Language polishing, Reference/style formatting, Plagiarism check (optional)',
      image: 'https://images.unsplash.com/photo-1523249610433-8c2fd68b2b58?q=80&w=1920&auto=format&fit=crop',
            imageUrl: 'https://images.unsplash.com/photo-1523249610433-8c2fd68b2b58?q=80&w=1920&auto=format&fit=crop',
            isFeatured: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            slug: 'research-design-consulting',
            title: 'Research Design Consulting',
            summary: 'Study design, methodology selection, and sampling strategy.',
            description: 'One‑to‑one consulting to craft robust study designs, choose appropriate methods, and plan feasible analysis pipelines.',
            category: 'Methodology',
            priceFrom: 199,
            currency: 'USD',
    features: 'Method selection, Data plan, Risk mitigation',
      image: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?q=80&w=1920&auto=format&fit=crop',
            imageUrl: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?q=80&w=1920&auto=format&fit=crop',
            isFeatured: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            slug: 'data-analysis',
            title: 'Data Analysis & Visualization',
            summary: 'Statistical analysis, dashboards, and publication‑quality figures.',
            description: 'From preprocessing to advanced analytics and visual storytelling using Python/R and modern BI tools.',
            category: 'Analytics',
            priceFrom: 299,
            currency: 'USD',
    features: 'Exploratory analysis, Modeling, Publication figures',
      image: 'https://images.unsplash.com/photo-1551281044-8c5f0a5f1b94?q=80&w=1920&auto=format&fit=crop',
            imageUrl: 'https://images.unsplash.com/photo-1551281044-8c5f0a5f1b94?q=80&w=1920&auto=format&fit=crop',
            isFeatured: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            slug: 'translation-services',
            title: 'Scientific Translation (EN/AR)',
            summary: 'Domain‑aware translation for manuscripts, abstracts, and reports.',
            description: 'Accurate, consistent, and publication‑grade translation by subject‑matter experts in both English and Arabic.',
            category: 'Translation',
            priceFrom: 99,
            currency: 'USD',
    features: 'Terminology management, Bilingual reviewers',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1920&auto=format&fit=crop',
            imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1920&auto=format&fit=crop',
            isFeatured: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            slug: 'grant-proposal-support',
            title: 'Grant Proposal Support',
            summary: 'Narrative development, budgeting, and submission readiness.',
            description: 'End‑to‑end support for compelling, funder‑aligned proposals including budgets and impact narratives.',
            category: 'Funding',
            priceFrom: 399,
            currency: 'USD',
    features: 'Funder alignment, Budget planning, Review response',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1920&auto=format&fit=crop',
            imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1920&auto=format&fit=crop',
            isFeatured: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            slug: 'workshops-and-training',
            title: 'Workshops & Training',
            summary: 'Hands‑on sessions on research methods, tools, and writing.',
            description: 'Instructor‑led workshops for teams and departments tailored to your field and skill levels.',
            category: 'Training',
            priceFrom: 249,
            currency: 'USD',
    features: 'Custom curricula, Certificates, Practical exercises',
      image: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1920&auto=format&fit=crop',
            imageUrl: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1920&auto=format&fit=crop',
            isFeatured: false,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        for (const svc of services) {
          await database.collection('services').replaceOne(
            { slug: svc.slug },
            svc,
            { upsert: true }
          );
        }

        // Normalize any existing services where features is an array -> join to CSV
        const existingServices = await database.collection('services').find({}, { projection: { _id: 1, features: 1, image: 1, imageUrl: 1 } }).toArray();
        for (const doc of existingServices) {
          if (Array.isArray(doc.features)) {
            await database.collection('services').updateOne(
              { _id: doc._id },
              { $set: { features: doc.features.join(', ') } }
            );
          }
          // Backfill image from imageUrl if missing
          if ((!doc.image || doc.image === '') && doc.imageUrl) {
            await database.collection('services').updateOne(
              { _id: doc._id },
              { $set: { image: doc.imageUrl } }
            );
          }
          // Ensure placeholder image if both missing
          if ((!doc.image || doc.image === '') && (!doc.imageUrl || doc.imageUrl === '')) {
            await database.collection('services').updateOne(
              { _id: doc._id },
              { $set: { image: 'https://via.placeholder.com/400x250/3B82F6/FFFFFF?text=Service' } }
            );
          }
        }

    console.log('👤 Test Users:');
    console.log('   🔑 Admin: admin@icsrt.com / admin123');
    console.log('   👤 User: testuser@icsrt.com / password123');
    console.log('   🛒 Customer: customer@icsrt.com / password123');
    console.log('🎟️ Coupons: WELCOME10, SAVE50, BIGDEAL20, PREMIUM15');

  } catch (error) {
    console.error('❌ Error creating enhanced test data:', error);
  }
};

// Auto-start frontend applications
const autoStartFrontends = () => {
  console.log('\n🚀 Auto-starting frontend applications...');
  
  // Start Dashboard on port 3001
  const dashboardPath = path.join(__dirname, '..', 'icsrt-dashboard');
  console.log('📁 Dashboard path:', dashboardPath);
  
  const dashboard = spawn('npm', ['start'], {
    cwd: dashboardPath,
    shell: true,
    env: { ...process.env, PORT: '3001', BROWSER: 'none' },
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  dashboard.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('webpack compiled') || output.includes('Local:') || output.includes('localhost:3001')) {
      console.log('✅ Dashboard ready: http://localhost:3001');
    }
  });

  dashboard.stderr.on('data', (data) => {
    const error = data.toString();
    if (!error.includes('Warning') && !error.includes('ResizeObserver')) {
      console.log('⚠️ Dashboard:', error.trim());
    }
  });
  
  // Start Userpage on port 3002
  const userpagePath = path.join(__dirname, '..', 'icsrt-userpage');
  console.log('📁 Userpage path:', userpagePath);
  
  const userpage = spawn('npm', ['start'], {
    cwd: userpagePath,
    shell: true,
    env: { ...process.env, PORT: '3002', BROWSER: 'none' },
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  userpage.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('webpack compiled') || output.includes('Local:') || output.includes('localhost:3002')) {
      console.log('✅ Userpage ready: http://localhost:3002');
      
      // Open browsers after both are ready
      setTimeout(() => {
        console.log('\n🌐 Opening applications in browser...');
        exec('start http://localhost:3001'); // Dashboard
        exec('start http://localhost:3002'); // Userpage
        
        console.log('\n🎉 ICSRT++ System is fully ready!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 Dashboard: http://localhost:3001');
        console.log('   🔑 Login: admin@icsrt.com / admin123');
        console.log('   🔗 Features: Purchase link generation');
        console.log('');
        console.log('👤 User Page: http://localhost:3002');
        console.log('   🔑 Login: testuser@icsrt.com / password123');
        console.log('   💜 Features: Pay with Link buttons');
        console.log('');
        console.log('🎟️ Test Coupons: WELCOME10, SAVE50, BIGDEAL20, PREMIUM15');
        console.log('🔗 Purchase Links: Auto-generated and ready');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }, 5000);
    }
  });

  userpage.stderr.on('data', (data) => {
    const error = data.toString();
    if (!error.includes('Warning') && !error.includes('ResizeObserver')) {
      console.log('⚠️ Userpage:', error.trim());
    }
  });
  
  // Handle process cleanup
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down all services...');
    dashboard.kill();
    userpage.kill();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down all services...');
    dashboard.kill();
    userpage.kill();
    process.exit(0);
  });
};

module.exports = { createEnhancedTestData, autoStartFrontends };
