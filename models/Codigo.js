const mongoose = require('mongoose');

const codigoSchema = new mongoose.Schema({
    codigo: { type: String, unique: true, required: true },
    premio: String,
    estado: { type: String, enum: ['activo', 'reclamado'], default: 'activo' },
    fecha: Date
});

module.exports = mongoose.model('Codigo', codigoSchema);
