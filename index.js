const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const sensorSchema = require('./models/sensorSchema');
const dotenv = require('dotenv')

dotenv.config()

const app = express();
const port = 7000;

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB", err);
});

// Define routes

// GET route to fetch data from MongoDB
// GET route to fetch data from MongoDB
app.get('/', async (req, res) => {
  try {
      // Fetch all documents
      let data = await sensorSchema.find();

      // Check the number of documents
      if (data.length > 20) {
          // Get the IDs of the documents to delete
          const idsToDelete = data.slice(0, -20).map(doc => doc._id);
          // Delete documents by IDs
          await sensorSchema.deleteMany({ _id: { $in: idsToDelete } });
          // Fetch data again after deletion
          data = await sensorSchema.find();
      }

      // Send the latest document
      const latestData = data[data.length - 1];
      res.send(latestData);
  } catch (err) {
      res.status(500).send(err);
  }
});


// POST route to save data to MongoDB
app.post('/send', async (req, res) => {
    try {
        const response = req.body;
        const savedData = await sensorSchema.create(response);
        res.send(savedData);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
