const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a deal title'],
        trim: true,
        maxlength: [50, 'Title cannot be more than 50 characters']
    },
    slug: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Deal', dealSchema);
