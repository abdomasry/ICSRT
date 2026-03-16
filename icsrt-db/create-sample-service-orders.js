// Create sample service orders with enhanced data structure
const { MongoClient, ObjectId } = require("mongodb");

const MONGODB_URI = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "icsrt_main";

async function createSampleServiceOrders() {
  let client;
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");
    
    const database = client.db(DATABASE_NAME);
    const collection = database.collection('service-orders');
    
    // Clear existing sample data (optional)
    await collection.deleteMany({ orderNumber: { $regex: /^SAMPLE-/ } });
    
    const sampleOrders = [
      {
        _id: new ObjectId(),
        orderNumber: "SAMPLE-2025-001",
        serviceName: "Conference Registration Management",
        userEmail: "john.smith@university.edu",
        status: "pending",
        totalAmount: 250.00,
        originalAmount: 300.00,
        discountApplied: 50.00,
        discountReason: "Early bird discount",
        discountType: "early-bird",
        submittedAt: new Date("2025-01-20T10:30:00Z").toISOString(),
        updatedAt: new Date().toISOString(),
        customerInfo: {
          name: "Dr. John Smith",
          email: "john.smith@university.edu",
          phone: "+1-555-123-4567",
          whatsapp: "15551234567",
          country: "United States",
          organization: "Stanford University",
          designation: "Associate Professor",
          profileImage: null,
          joinDate: new Date("2024-06-15T08:00:00Z").toISOString(),
          lastActive: new Date("2025-01-24T15:20:00Z").toISOString()
        },
        messages: [
          {
            id: "msg-1737833400000-abc123",
            sender: "user",
            channel: "userpage",
            type: "text",
            message: "Hello, I would like to register for the upcoming AI conference. Can you provide more details about the registration packages?",
            timestamp: new Date("2025-01-20T11:00:00Z").toISOString(),
            read: true,
            delivered: true,
            metadata: {
              senderInfo: "Customer",
              ipAddress: "192.168.1.100"
            }
          },
          {
            id: "msg-1737837000000-def456",
            sender: "admin",
            channel: "userpage",
            type: "text",
            message: "Hello Dr. Smith! Thank you for your interest. We have several packages available including early bird pricing. I've prepared a custom quote for you based on your academic affiliation.",
            timestamp: new Date("2025-01-20T12:00:00Z").toISOString(),
            read: true,
            delivered: true,
            metadata: {
              senderInfo: "Admin Team"
            }
          },
          {
            id: "msg-1737840600000-ghi789",
            sender: "system",
            channel: "system",
            type: "price-update",
            message: "Price updated from $300 to $250. Reason: Early bird discount for academic institution",
            timestamp: new Date("2025-01-20T13:00:00Z").toISOString(),
            read: true,
            metadata: {
              priceChange: {
                previous: 300,
                new: 250,
                change: -50,
                discount: 50,
                reason: "Early bird discount for academic institution"
              }
            }
          },
          {
            id: "msg-1737926400000-jkl012",
            sender: "user",
            channel: "userpage",
            type: "text",
            message: "Thank you for the discount! That looks great. I'd like to proceed with the registration. What are the next steps?",
            timestamp: new Date("2025-01-21T12:00:00Z").toISOString(),
            read: false,
            delivered: true,
            metadata: {
              senderInfo: "Customer",
              ipAddress: "192.168.1.100"
            }
          }
        ],
        messageStats: {
          total: 4,
          unread: 1,
          lastMessage: {
            id: "msg-1737926400000-jkl012",
            message: "Thank you for the discount! That looks great. I'd like to proceed with the registration. What are the next steps?",
            timestamp: new Date("2025-01-21T12:00:00Z").toISOString(),
            sender: "user"
          }
        },
        priceHistory: [
          {
            id: "price-1737833400000",
            previousAmount: 0,
            newAmount: 300,
            priceChange: 300,
            discountApplied: 0,
            reason: "Initial quote",
            changedBy: "system",
            timestamp: new Date("2025-01-20T10:30:00Z").toISOString(),
            effectiveDate: new Date("2025-01-20T10:30:00Z").toISOString(),
            metadata: {
              originalAmount: 300,
              totalDiscountFromOriginal: 0,
              percentageChange: 0,
              discountPercentage: 0
            }
          },
          {
            id: "price-1737840600000",
            previousAmount: 300,
            newAmount: 250,
            priceChange: -50,
            discountApplied: 50,
            discountType: "early-bird",
            reason: "Early bird discount for academic institution",
            changedBy: "admin",
            timestamp: new Date("2025-01-20T13:00:00Z").toISOString(),
            effectiveDate: new Date("2025-01-20T13:00:00Z").toISOString(),
            metadata: {
              originalAmount: 300,
              totalDiscountFromOriginal: 50,
              percentageChange: -16.67,
              discountPercentage: 16.67
            }
          }
        ],
        statusHistory: [
          {
            status: "pending",
            reason: "New order received",
            timestamp: new Date("2025-01-20T10:30:00Z").toISOString(),
            changedBy: "system"
          }
        ],
        communicationChannels: {
          userpage: true,
          whatsapp: true,
          email: true,
          phone: true
        },
        supportContact: {
          whatsapp: "+1-234-567-8900",
          email: "support@icsrt.com"
        },
        details: {
          conferenceType: "AI & Machine Learning",
          participationType: "In-person",
          specialRequirements: "Vegetarian meals, presentation equipment",
          registrationDeadline: "2025-02-15"
        },
        lastMessageAt: new Date("2025-01-21T12:00:00Z").toISOString(),
        priceUpdatedAt: new Date("2025-01-20T13:00:00Z").toISOString(),
        statusUpdatedAt: new Date("2025-01-20T10:30:00Z").toISOString()
      },
      {
        _id: new ObjectId(),
        orderNumber: "SAMPLE-2025-002",
        serviceName: "Journal Publication Support",
        userEmail: "maria.garcia@research.org",
        status: "in-progress",
        totalAmount: 180.00,
        originalAmount: 200.00,
        discountApplied: 20.00,
        discountReason: "Loyalty customer discount",
        discountType: "loyalty",
        submittedAt: new Date("2025-01-18T14:15:00Z").toISOString(),
        updatedAt: new Date().toISOString(),
        customerInfo: {
          name: "Dr. Maria Garcia",
          email: "maria.garcia@research.org",
          phone: "+34-612-345-678",
          whatsapp: "34612345678",
          country: "Spain",
          organization: "International Research Institute",
          designation: "Senior Research Scientist",
          profileImage: null,
          joinDate: new Date("2023-03-10T09:00:00Z").toISOString(),
          lastActive: new Date("2025-01-24T11:45:00Z").toISOString()
        },
        messages: [
          {
            id: "msg-1737208500000-mno345",
            sender: "user",
            channel: "email",
            type: "text",
            message: "I need assistance with submitting my research paper to your journal. Can you help with the peer review process?",
            timestamp: new Date("2025-01-18T14:15:00Z").toISOString(),
            read: true,
            delivered: true,
            metadata: {
              senderInfo: "Customer",
              ipAddress: "185.76.8.234"
            }
          },
          {
            id: "msg-1737211200000-pqr678",
            sender: "admin",
            channel: "email",
            type: "text",
            message: "Absolutely! We offer comprehensive journal publication support including peer review coordination, formatting, and submission assistance. Given your history with us, I've applied a loyalty discount.",
            timestamp: new Date("2025-01-18T15:00:00Z").toISOString(),
            read: true,
            delivered: true,
            metadata: {
              senderInfo: "Admin Team"
            }
          },
          {
            id: "msg-1737295800000-stu901",
            sender: "system",
            channel: "system",
            type: "status-update",
            message: "Order status changed from \"pending\" to \"in-progress\". Work has begun on your journal submission.",
            timestamp: new Date("2025-01-19T14:30:00Z").toISOString(),
            read: true,
            metadata: {
              previousStatus: "pending",
              newStatus: "in-progress",
              reason: "Work has begun on your journal submission."
            }
          },
          {
            id: "msg-1737382200000-vwx234",
            sender: "admin",
            channel: "whatsapp",
            type: "text",
            message: "Update: Your paper has been formatted and is ready for initial review. Expected completion in 3-5 business days.",
            timestamp: new Date("2025-01-20T14:30:00Z").toISOString(),
            read: true,
            delivered: true,
            metadata: {
              senderInfo: "Admin Team"
            }
          }
        ],
        messageStats: {
          total: 4,
          unread: 0,
          lastMessage: {
            id: "msg-1737382200000-vwx234",
            message: "Update: Your paper has been formatted and is ready for initial review. Expected completion in 3-5 business days.",
            timestamp: new Date("2025-01-20T14:30:00Z").toISOString(),
            sender: "admin"
          }
        },
        priceHistory: [
          {
            id: "price-1737208500000",
            previousAmount: 0,
            newAmount: 200,
            priceChange: 200,
            discountApplied: 0,
            reason: "Initial quote",
            changedBy: "system",
            timestamp: new Date("2025-01-18T14:15:00Z").toISOString(),
            effectiveDate: new Date("2025-01-18T14:15:00Z").toISOString(),
            metadata: {
              originalAmount: 200,
              totalDiscountFromOriginal: 0,
              percentageChange: 0,
              discountPercentage: 0
            }
          },
          {
            id: "price-1737211200000",
            previousAmount: 200,
            newAmount: 180,
            priceChange: -20,
            discountApplied: 20,
            discountType: "loyalty",
            reason: "Loyalty customer discount",
            changedBy: "admin",
            timestamp: new Date("2025-01-18T15:00:00Z").toISOString(),
            effectiveDate: new Date("2025-01-18T15:00:00Z").toISOString(),
            metadata: {
              originalAmount: 200,
              totalDiscountFromOriginal: 20,
              percentageChange: -10.0,
              discountPercentage: 10.0
            }
          }
        ],
        statusHistory: [
          {
            status: "pending",
            reason: "New order received",
            timestamp: new Date("2025-01-18T14:15:00Z").toISOString(),
            changedBy: "system"
          },
          {
            status: "in-progress",
            reason: "Work has begun on your journal submission.",
            timestamp: new Date("2025-01-19T14:30:00Z").toISOString(),
            changedBy: "admin"
          }
        ],
        communicationChannels: {
          userpage: true,
          whatsapp: true,
          email: true,
          phone: true
        },
        supportContact: {
          whatsapp: "+1-234-567-8900",
          email: "support@icsrt.com"
        },
        details: {
          journalType: "Computer Science",
          paperTitle: "Advanced Machine Learning Algorithms for Data Analysis",
          expectedPages: "15-20",
          submissionDeadline: "2025-02-28",
          reviewType: "Peer Review"
        },
        lastMessageAt: new Date("2025-01-20T14:30:00Z").toISOString(),
        priceUpdatedAt: new Date("2025-01-18T15:00:00Z").toISOString(),
        statusUpdatedAt: new Date("2025-01-19T14:30:00Z").toISOString()
      },
      {
        _id: new ObjectId(),
        orderNumber: "SAMPLE-2025-003",
        serviceName: "Event Management Services",
        userEmail: "alex.chen@techcorp.com",
        status: "completed",
        totalAmount: 500.00,
        originalAmount: 500.00,
        discountApplied: 0,
        submittedAt: new Date("2025-01-15T09:20:00Z").toISOString(),
        updatedAt: new Date().toISOString(),
        customerInfo: {
          name: "Alex Chen",
          email: "alex.chen@techcorp.com",
          phone: "+86-138-0013-8000",
          whatsapp: null,
          country: "China",
          organization: "TechCorp Solutions",
          designation: "Event Coordinator",
          profileImage: null,
          joinDate: new Date("2024-11-05T10:00:00Z").toISOString(),
          lastActive: new Date("2025-01-23T16:30:00Z").toISOString()
        },
        messages: [
          {
            id: "msg-1736936400000-yza567",
            sender: "user",
            channel: "userpage",
            type: "text",
            message: "We need comprehensive event management for our annual tech summit. Around 200 attendees expected.",
            timestamp: new Date("2025-01-15T09:20:00Z").toISOString(),
            read: true,
            delivered: true,
            metadata: {
              senderInfo: "Customer",
              ipAddress: "114.255.41.8"
            }
          },
          {
            id: "msg-1736940000000-bcd890",
            sender: "admin",
            channel: "userpage",
            type: "text",
            message: "Perfect! We can handle all aspects of your tech summit including venue coordination, registration management, and technical support. Let me prepare a comprehensive proposal.",
            timestamp: new Date("2025-01-15T10:20:00Z").toISOString(),
            read: true,
            delivered: true,
            metadata: {
              senderInfo: "Admin Team"
            }
          },
          {
            id: "msg-1737468600000-efg123",
            sender: "system",
            channel: "system",
            type: "status-update",
            message: "Order status changed from \"in-progress\" to \"completed\". Event successfully executed.",
            timestamp: new Date("2025-01-21T14:30:00Z").toISOString(),
            read: true,
            metadata: {
              previousStatus: "in-progress",
              newStatus: "completed",
              reason: "Event successfully executed."
            }
          },
          {
            id: "msg-1737555000000-hij456",
            sender: "admin",
            channel: "email",
            type: "text",
            message: "Thank you for choosing our services! Your tech summit was a great success. We've sent the final report and invoice. Hope to work with you again!",
            timestamp: new Date("2025-01-22T14:30:00Z").toISOString(),
            read: true,
            delivered: true,
            metadata: {
              senderInfo: "Admin Team"
            }
          }
        ],
        messageStats: {
          total: 4,
          unread: 0,
          lastMessage: {
            id: "msg-1737555000000-hij456",
            message: "Thank you for choosing our services! Your tech summit was a great success. We've sent the final report and invoice. Hope to work with you again!",
            timestamp: new Date("2025-01-22T14:30:00Z").toISOString(),
            sender: "admin"
          }
        },
        priceHistory: [
          {
            id: "price-1736936400000",
            previousAmount: 0,
            newAmount: 500,
            priceChange: 500,
            discountApplied: 0,
            reason: "Initial quote for comprehensive event management",
            changedBy: "system",
            timestamp: new Date("2025-01-15T09:20:00Z").toISOString(),
            effectiveDate: new Date("2025-01-15T09:20:00Z").toISOString(),
            metadata: {
              originalAmount: 500,
              totalDiscountFromOriginal: 0,
              percentageChange: 0,
              discountPercentage: 0
            }
          }
        ],
        statusHistory: [
          {
            status: "pending",
            reason: "New order received",
            timestamp: new Date("2025-01-15T09:20:00Z").toISOString(),
            changedBy: "system"
          },
          {
            status: "in-progress",
            reason: "Event planning commenced",
            timestamp: new Date("2025-01-16T10:00:00Z").toISOString(),
            changedBy: "admin"
          },
          {
            status: "completed",
            reason: "Event successfully executed.",
            timestamp: new Date("2025-01-21T14:30:00Z").toISOString(),
            changedBy: "admin"
          }
        ],
        communicationChannels: {
          userpage: true,
          whatsapp: false,
          email: true,
          phone: true
        },
        supportContact: {
          whatsapp: "+1-234-567-8900",
          email: "support@icsrt.com"
        },
        details: {
          eventType: "Tech Summit",
          expectedAttendees: "200",
          venue: "Shanghai Convention Center",
          eventDate: "2025-01-20",
          specialRequirements: "Live streaming, simultaneous translation"
        },
        lastMessageAt: new Date("2025-01-22T14:30:00Z").toISOString(),
        priceUpdatedAt: new Date("2025-01-15T09:20:00Z").toISOString(),
        statusUpdatedAt: new Date("2025-01-21T14:30:00Z").toISOString()
      }
    ];
    
    // Insert sample orders
    const result = await collection.insertMany(sampleOrders);
    console.log(`✅ Created ${result.insertedCount} sample service orders`);
    
    // Display summary
    console.log("\n📊 Sample Service Orders Created:");
    for (const order of sampleOrders) {
      console.log(`  • ${order.orderNumber} - ${order.customerInfo.name} (${order.status})`);
      console.log(`    Service: ${order.serviceName}`);
      console.log(`    Amount: $${order.totalAmount} (${order.messageStats.total} messages, ${order.messageStats.unread} unread)`);
      console.log("");
    }
    
    console.log("✅ Sample data creation completed!");
    console.log("🚀 You can now test the enhanced admin service orders interface");
    
  } catch (error) {
    console.error("❌ Error creating sample service orders:", error);
  } finally {
    if (client) {
      await client.close();
      console.log("📤 Database connection closed");
    }
  }
}

// Run the script
createSampleServiceOrders();
