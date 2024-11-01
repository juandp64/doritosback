const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    pass: { type: String, required: true },
    rol: { type: String, enum: ['user', 'admin'], required: true }
}, { timestamps: true }); // Timestamps para seguimiento de creación y actualización

module.exports = mongoose.model('User', userSchema);
