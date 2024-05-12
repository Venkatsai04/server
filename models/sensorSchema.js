const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
    distance: {
        type: Number,
        required: true
    },
    alert: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('data', sensorSchema);
