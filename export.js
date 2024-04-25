const admin = require('firebase-admin');
const fs = require('fs');
const serviceAccount = require('./service_worker.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function exportCollectionData() {
  const collections = await db.listCollections();

  for (const collection of collections) {
    const snapshot = await collection.get();
    const collectionData = {};

    snapshot.forEach(doc => {
      collectionData[doc.id] = doc.data();
    });

    fs.writeFileSync(`${collection.id}.json`, JSON.stringify(collectionData, null, 2));
  }
}

exportCollectionData()
  .then(() => {
    console.log('Exported all collections successfully!');
  })
  .catch(error => {
    console.error('Error exporting collections:', error);
  });
