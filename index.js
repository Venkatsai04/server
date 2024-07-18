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

// GET route to fetch the latest data from MongoDB
app.get('/', async (req, res) => {
  try {
      // Fetch the most recent document
      let latestData = await sensorSchema.find();

      const data = latestData[latestData.length - 1];
      // console.log(data);

      if (latestData) {
          res.send(data);
      } else {
          res.status(404).send("No data found");
      }
  } catch (err) {
      res.status(500).send(err);
  }
});

// POST route to save data to MongoDB and delete old documents if they exceed 20
app.post('/send', async (req, res) => {
    try {
        const response = req.body;
        // Save the new data
        const savedData = await sensorSchema.create(response);
        
        // Fetch all documents
        const dataCount = await sensorSchema.countDocuments();

        // Check if the number of documents exceeds 20
        if (dataCount > 20) {
            // Fetch the IDs of the oldest documents to delete
            const idsToDelete = await sensorSchema.find()
                .sort({ createdAt: 1 }) // Sort in ascending order by createdAt to get the oldest documents
                .limit(dataCount - 20)  // Limit to the number of documents that need to be deleted
                .select('_id');         // Select only the _id field

            // Extract the IDs from the result
            const deleteIds = idsToDelete.map(doc => doc._id);

            // Delete the oldest documents
            await sensorSchema.deleteMany({ _id: { $in: deleteIds } });
        }

        res.send(savedData);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
