const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function seed() {
  try {
    await client.connect();
    const db = client.db('icsrt');

    // Submissions
    await db.collection('submissions').insertMany([
      {
        title: "AI in Education",
        author: "John Doe",
        email: "john@example.com",
        conference: "ICSRT 2025",
        status: "pending",
        fileUrl: "/uploads/ai-paper.pdf",
        submittedAt: new Date()
      }
    ]);

    // Registration Fees
    await db.collection('registration-fees').insertMany([
      {
        category: "Student",
        description: "Undergraduate and postgraduate students",
        amount: 100,
        currency: "USD",
        deadline: new Date("2025-07-01")
      },
      {
        category: "Academic",
        description: "University faculty and researchers",
        amount: 200,
        currency: "USD",
        deadline: new Date("2025-07-01")
      }
    ]);

    // Programs
    await db.collection('programs').insertMany([
      {
        title: "Opening Ceremony",
        description: "Welcome and introduction to the conference",
        day: "Day 1",
        time: "10:00 AM",
        location: "Main Hall"
      }
    ]);

    // Key Dates
    await db.collection('keydates').insertMany([
      {
        title: "Abstract Submission Deadline",
        description: "Last date to submit abstracts",
        date: new Date("2025-06-15")
      }
    ]);

    // Downloads
    await db.collection('downloads').insertMany([
      {
        title: "Conference Brochure",
        fileUrl: "/files/brochure.pdf",
        description: "All you need to know",
        uploadedAt: new Date()
      }
    ]);

    // Contact Info
    await db.collection('contact-info').insertMany([
      {
        type: "email",
        value: "info@icsrt-me.com"
      },
      {
        type: "phone",
        value: "+971-123-456-789"
      }
    ]);

    // Important Links
    await db.collection('important-links').insertMany([
      {
        title: "IEEE Official Site",
        url: "https://ieee.org"
      }
    ]);

    console.log("✅ Database seeded successfully.");
  } catch (err) {
    console.error("❌ Error seeding database:", err);
  } finally {
    await client.close();
  }
}

seed();
