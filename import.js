const admin = require('firebase-admin');
const serviceAccount = require('./service_worker.json');
const data = require('./data.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

Object.entries(data).forEach(([docId, docData]) => {
  const docRef = db.collection('CollectionName').doc(docId);

  // Fetch the existing document data
  docRef.get().then((existingDoc) => {
    if (existingDoc.exists) {
      const existingData = existingDoc.data();

      // Check each field for changes
      const fieldsToUpdate = {};
      let hasChanges = false;

      Object.keys(docData).forEach(field => {
        if (!existingData.hasOwnProperty(field) || !isEqual(existingData[field], docData[field])) {
          fieldsToUpdate[field] = docData[field];
          hasChanges = true;
        }
      });

      if (hasChanges) {
        // Update the document with changed fields
        docRef.update(fieldsToUpdate).then(() => {
          Object.entries(fieldsToUpdate).forEach(([field, newValue]) => {
            const oldValue = existingData[field];
            console.log(`Document ${docId}, Field ${field} updated. Old Value: ${JSON.stringify(oldValue)}, New Value: ${JSON.stringify(newValue)}`);
          });
        }).catch(error => {
          console.error(`Error updating document ${docId}:`, error);
        });
      } else {
        console.log(`Document ${docId} is already up to date. No changes needed.`);
      }
    } else {
      // Document doesn't exist, create it
      docRef.set(docData).then(() => {
        console.log(`Document ${docId} created successfully.`);
      }).catch(error => {
        console.error(`Error creating document ${docId}:`, error);
      });
    }
  }).catch(error => {
    console.error(`Error fetching document ${docId}:`, error);
  });
});

// Function to deep compare objects
function isEqual(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}