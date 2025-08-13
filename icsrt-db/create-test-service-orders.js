const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = "mongodb+srv://testuser:testpassword@cluster0.m0q4k.mongodb.net/icsrt_main?retryWrites=true&w=majority";

async function createTestServiceOrders() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const database = client.db('icsrt_main');
    const serviceOrders = database.collection('service-orders');
    
    // Check if orders already exist
    const existingCount = await serviceOrders.countDocuments();
    console.log(`Existing service orders: ${existingCount}`);
    
    if (existingCount === 0) {
      console.log('Creating test service orders...');
      
      const testOrders = [
        {
          _id: new ObjectId(),
          orderNumber: 'ORD-2024-001',
          serviceName: 'Conference Registration',
          serviceType: 'conference',
          status: 'completed',
          totalAmount: 350,
          originalAmount: 400,
          discountApplied: 50,
          discountReason: 'Early bird registration',
          userEmail: 'ahmed@cairo.edu.eg',
          customerInfo: {
            name: 'Ahmed Mohamed',
            email: 'ahmed@cairo.edu.eg',
            phone: '+20-123-456-7890',
            whatsapp: '+20-123-456-7890',
            country: 'Egypt',
            organization: 'Cairo University',
            designation: 'Research Engineer'
          },
          submittedAt: '2024-07-15T09:00:00Z',
          updatedAt: '2024-07-20T14:30:00Z',
          createdAt: '2024-07-15T09:00:00Z',
          details: {
            conferenceId: 'ICSRT-2024',
            conferenceName: 'International Conference on Software Research and Technology',
            participantType: 'Regular',
            accommodations: 'Hotel Room (2 nights)',
            dietaryRestrictions: 'Vegetarian'
          },
          priceHistory: [
            {
              amount: 400,
              reason: 'Initial quote',
              changedBy: 'system',
              timestamp: '2024-07-15T09:00:00Z'
            },
            {
              amount: 350,
              reason: 'Early bird discount applied',
              changedBy: 'admin',
              timestamp: '2024-07-16T11:00:00Z'
            }
          ],
          messages: [
            {
              id: 'msg-1',
              sender: 'user',
              channel: 'userpage',
              message: 'Thank you for processing my conference registration!',
              timestamp: '2024-07-16T10:00:00Z'
            },
            {
              id: 'msg-2',
              sender: 'support',
              channel: 'userpage',
              message: 'You\'re welcome! We\'ve applied an early bird discount. Your registration is confirmed.',
              timestamp: '2024-07-16T11:00:00Z'
            }
          ],
          communicationChannels: {
            userpage: true,
            whatsapp: true,
            email: true
          },
          supportContact: {
            whatsapp: '+1-234-567-8900',
            email: 'conference@icsrt.com'
          }
        },
        {
          _id: new ObjectId(),
          orderNumber: 'ORD-2024-002',
          serviceName: 'Paper Review Service',
          serviceType: 'review',
          status: 'in-progress',
          totalAmount: 200,
          originalAmount: 250,
          discountApplied: 50,
          discountReason: 'Student discount',
          userEmail: 'sarah@mit.edu',
          customerInfo: {
            name: 'Sarah Johnson',
            email: 'sarah@mit.edu',
            phone: '+1-555-987-6543',
            whatsapp: '+1-555-987-6543',
            country: 'United States',
            organization: 'MIT',
            designation: 'PhD Student'
          },
          submittedAt: '2024-07-10T14:30:00Z',
          updatedAt: '2024-07-22T09:15:00Z',
          createdAt: '2024-07-10T14:30:00Z',
          details: {
            paperTitle: 'Advanced Machine Learning Techniques in Modern Software Development',
            reviewType: 'Comprehensive Review',
            deadline: '2024-08-01',
            specialRequirements: 'Focus on practical applications'
          },
          priceHistory: [
            {
              amount: 250,
              reason: 'Standard review price',
              changedBy: 'system',
              timestamp: '2024-07-10T14:30:00Z'
            },
            {
              amount: 200,
              reason: 'Student discount applied',
              changedBy: 'admin',
              timestamp: '2024-07-11T09:00:00Z'
            }
          ],
          messages: [
            {
              id: 'msg-3',
              sender: 'user',
              channel: 'userpage',
              message: 'When will the review be completed? I need it for submission deadline.',
              timestamp: '2024-07-20T14:00:00Z'
            },
            {
              id: 'msg-4',
              sender: 'support',
              channel: 'userpage',
              message: 'Your paper review is progressing well. We expect to complete it by July 28th, well before your deadline.',
              timestamp: '2024-07-20T16:30:00Z'
            }
          ],
          communicationChannels: {
            userpage: true,
            whatsapp: true,
            email: true
          },
          supportContact: {
            whatsapp: '+1-234-567-8901',
            email: 'review@icsrt.com'
          }
        },
        {
          _id: new ObjectId(),
          orderNumber: 'ORD-2024-003',
          serviceName: 'Journal Publication Service',
          serviceType: 'publication',
          status: 'pending',
          totalAmount: 480,
          originalAmount: 480,
          userEmail: 'ali@dit.ae',
          customerInfo: {
            name: 'Dr. Ali Hassan',
            email: 'ali@dit.ae',
            phone: '+971-50-123-4567',
            whatsapp: '+971-50-123-4567',
            country: 'UAE',
            organization: 'Dubai Institute of Technology',
            designation: 'Senior Researcher'
          },
          submittedAt: '2024-07-05T11:15:00Z',
          updatedAt: '2024-07-05T11:15:00Z',
          createdAt: '2024-07-05T11:15:00Z',
          details: {
            journalName: 'ICSRT Journal of Software Engineering',
            articleTitle: 'Innovative Approaches to Distributed Systems Architecture',
            authorCount: 3,
            pageCount: 12,
            submissionType: 'Research Article'
          },
          priceHistory: [
            {
              amount: 480,
              reason: 'Standard publication fee',
              changedBy: 'system',
              timestamp: '2024-07-05T11:15:00Z'
            }
          ],
          messages: [
            {
              id: 'msg-6',
              sender: 'user',
              channel: 'email',
              message: 'I submitted my article for publication. When can I expect the initial review?',
              timestamp: '2024-07-06T09:00:00Z'
            }
          ],
          communicationChannels: {
            userpage: true,
            whatsapp: true,
            email: true
          },
          supportContact: {
            whatsapp: null,
            email: 'journal@icsrt.com'
          }
        }
      ];
      
      const result = await serviceOrders.insertMany(testOrders);
      console.log(`Created ${result.insertedCount} service orders`);
      console.log('Service orders created with IDs:', Object.values(result.insertedIds));
    } else {
      console.log('Service orders already exist in database');
    }
    
    // Display current orders
    const orders = await serviceOrders.find({}).toArray();
    console.log('\nCurrent service orders in database:');
    orders.forEach(order => {
      console.log(`- ${order.orderNumber}: ${order.serviceName} (${order.status}) - ${order.customerInfo?.name || order.userEmail}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

createTestServiceOrders();
