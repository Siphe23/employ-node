const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());  // Enable CORS for all origins
app.use(bodyParser.json());

// Log environment variables to check they are being loaded correctly
console.log('Firebase Project ID:', process.env.FIREBASE_PROJECT_ID);
console.log('Firebase Client Email:', process.env.FIREBASE_CLIENT_EMAIL);

// Ensure Firebase credentials are defined before proceeding
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (!privateKey) {
  console.error('Firebase private key is not defined.');
  process.exit(1);  // Stop the app if the private key is missing
}

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: privateKey.replace(/\\n/g, '\n'),  // Handle newlines in private key
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

const db = admin.firestore();

// Set up multer to store images locally
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store uploaded files in the 'uploads' directory
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Use the original filename for the uploaded file
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Add a new employee
app.post('/employees', async (req, res) => {
  const { name, email, phone, position, employeeId, gender, image } = req.body;

  try {
    const employeeData = { name, email, phone, position, employeeId, gender, image };
    const docRef = await db.collection('employees').add(employeeData);
    res.status(201).send({ id: docRef.id, ...employeeData });
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).send('Error adding employee');
  }
});

// Get all employees
app.get('/employees', async (req, res) => {
  try {
    const snapshot = await db.collection('employees').get();
    const employees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.send(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).send('Error fetching employees');
  }
});

// Endpoint to upload the image
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  // Get the file path after saving it locally
  const filePath = `/uploads/${req.file.filename}`;

  try {
    res.status(200).send({ imageUrl: filePath });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send('Error processing file');
  }
});

// Start the server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
