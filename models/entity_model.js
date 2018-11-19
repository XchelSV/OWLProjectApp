import mongoose from 'mongoose';
const Schema = mongoose.Schema;

    const EntitySchema = new Schema({
	    name: { type: String, required: true },
	    date: { type: Date, required: true },
	    class: {type: Schema.Types.ObjectId, ref: 'Onto_Class'},
	});


module.exports = mongoose.model('Entity', EntitySchema);