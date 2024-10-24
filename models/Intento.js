const mongoose = require('mongoose');

const intentoSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    codigo: String,
    fecha: Date
});

module.exports = mongoose.model('Intento', intentoSchema);
