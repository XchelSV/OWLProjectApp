import mongoose from 'mongoose';
const Schema = mongoose.Schema;

    const OntologySchema = new Schema({
	    name: { type: String, required: true },
	    date: { type: Date, required: true },
	    user: {type: Schema.Types.ObjectId, ref: 'User'},
	});


module.exports = mongoose.model('Ontology', OntologySchema);