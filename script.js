require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb'); // Import MongoDB client
const path = require('path'); // Import path module

const app = express();
const PORT = process.env.PORT || 5000; // Use Render's dynamic port or fallback to 5000

// Middleware
app.use(bodyParser.json());
app.use(cors({ origin: '*' })); // Allow all origins

// Serve static files
const staticPath = path.join(__dirname, 'public'); // Adjust 'public' to your static files directory
app.use(express.static(staticPath));

// Fallback for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

// MongoDB connection
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.mongodb.net/tourBooking?retryWrites=true&w=majority`;
const client = new MongoClient(uri);
let db, toursCollection, adminCollection;

async function connectToDatabase() {
    try {
        await client.connect();
        db = client.db('tourBooking');
        toursCollection = db.collection('tours');
        adminCollection = db.collection('admins');
        console.log('Connected to MongoDB Atlas');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit the process if the database connection fails
    }
}
connectToDatabase();

// Routes
// Get all tours
app.get('/api/tours', async (req, res) => {
    try {
        const tours = await toursCollection.find().toArray();
        res.json(tours);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching tours from MongoDB' });
    }
});

// Add a new tour
app.post('/api/tours', async (req, res) => {
    const { title, description, price } = req.body;
    try {
        const result = await toursCollection.insertOne({ title, description, price });
        res.status(201).json(result.ops[0]); // Return the newly created tour
    } catch (err) {
        res.status(500).json({ message: 'Error adding tour to MongoDB' });
    }
});

// Edit a tour
app.put('/api/tours/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, price } = req.body;
    try {
        const result = await toursCollection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { title, description, price } },
            { returnDocument: 'after' }
        );
        if (result.value) {
            res.json(result.value);
        } else {
            res.status(404).json({ message: 'Tour not found in MongoDB' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error updating tour in MongoDB' });
    }
});

// Delete a tour
app.delete('/api/tours/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await toursCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount > 0) {
            res.json({ message: 'Tour deleted from MongoDB' });
        } else {
            res.status(404).json({ message: 'Tour not found in MongoDB' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error deleting tour from MongoDB' });
    }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await adminCollection.findOne({ username, password });
        if (admin) {
            res.json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error during admin login in MongoDB' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
