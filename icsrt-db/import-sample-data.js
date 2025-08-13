const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

const IMPORT_SAMPLE_DATA = async () => {
  console.log('📄 IMPORTING SAMPLE DATA TO DATABASE');
  console.log('====================================\n');
  
  try {
    const uri = "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('icsrt_main');
    console.log('✅ Connected to MongoDB Atlas - Database: icsrt_main');
    
    // JSON files to import
    const jsonFiles = [
      { file: 'icsrt_papers.json', collection: 'papers' },
      { file: 'icsrt_conferences.json', collection: 'conferences' },
      { file: 'icsrt_events.json', collection: 'events' },
      { file: 'icsrt_news.json', collection: 'news' },
      { file: 'icsrt_journals.json', collection: 'journals' },
      { file: 'icsrt_speakers.json', collection: 'speakers' },
      { file: 'icsrt_services.json', collection: 'services' },
      { file: 'icsrt_testimonials.json', collection: 'testimonials' },
      { file: 'icsrt_faq.json', collection: 'faq' },
      { file: 'icsrt_gallery.json', collection: 'gallery' },
      { file: 'icsrt_contacts.json', collection: 'contacts' },
      { file: 'icsrt_registrations.json', collection: 'registrations' }
    ];
    
    let totalImported = 0;
    
    for (const { file, collection } of jsonFiles) {
      try {
        const filePath = path.join(__dirname, file);
        const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
        
        if (fileExists) {
          const jsonData = await fs.readFile(filePath, 'utf8');
          const data = JSON.parse(jsonData);
          
          if (Array.isArray(data) && data.length > 0) {
            // Clear existing data
            await db.collection(collection).deleteMany({});
            
            // Add timestamps to each document
            const documentsWithTimestamps = data.map(doc => ({
              ...doc,
              _id: undefined, // Let MongoDB generate new IDs
              createdAt: doc.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }));
            
            const result = await db.collection(collection).insertMany(documentsWithTimestamps);
            console.log(`✅ Imported ${result.insertedCount} documents into ${collection}`);
            totalImported += result.insertedCount;
          } else {
            console.log(`⚠️ ${file} is empty or invalid`);
          }
        } else {
          console.log(`⚠️ ${file} not found, skipping...`);
        }
      } catch (error) {
        console.log(`❌ Error importing ${file}: ${error.message}`);
      }
    }
    
    // Add some sample users
    console.log('\n👥 Adding Sample Users...');
    await db.collection('users').deleteMany({});
    const sampleUsers = [
      {
        name: 'Dr. Ahmed Hassan',
        email: 'ahmed.hassan@university.edu',
        phone: '+20-1234567890',
        affiliation: 'Cairo University',
        fieldOfStudy: 'Computer Science',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        name: 'Prof. Sarah Johnson',
        email: 'sarah.johnson@tech.edu',
        phone: '+1-555-0123',
        affiliation: 'MIT',
        fieldOfStudy: 'Artificial Intelligence',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        name: 'Dr. Mohammed Al-Rashid',
        email: 'mohammed.alrashid@ksu.edu',
        phone: '+966-501234567',
        affiliation: 'King Saud University',
        fieldOfStudy: 'Environmental Engineering',
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];
    
    const userResult = await db.collection('users').insertMany(sampleUsers);
    console.log(`✅ Added ${userResult.insertedCount} sample users`);
    totalImported += userResult.insertedCount;
    
    // Verify final counts
    console.log('\n📊 Final Collection Counts:');
    for (const { collection } of jsonFiles) {
      const count = await db.collection(collection).countDocuments();
      console.log(`  - ${collection}: ${count} documents`);
    }
    const userCount = await db.collection('users').countDocuments();
    console.log(`  - users: ${userCount} documents`);
    
    console.log(`\n🎉 IMPORT COMPLETE!`);
    console.log(`✅ Total documents imported: ${totalImported}`);
    console.log(`✅ Database populated with sample data`);
    console.log(`✅ Dashboard will now show data at http://localhost:3001`);
    
    await client.close();
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
};

// Run the import if this file is executed directly
if (require.main === module) {
  IMPORT_SAMPLE_DATA()
    .then(() => {
      console.log('\n✅ Data import completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Data import failed:', error);
      process.exit(1);
    });
}

module.exports = IMPORT_SAMPLE_DATA;
