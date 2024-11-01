const mongoose = require('mongoose');

const codigoSchema = new mongoose.Schema({
    codigo: { type: String, unique: true, required: true },
    premio: String,
    estado: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Estado para el ID del usuario que reclamó
    fecha: { type: Date, default: Date.now } // Agregamos fecha con valor por defecto
});

module.exports = mongoose.model('Codigo', codigoSchema);

