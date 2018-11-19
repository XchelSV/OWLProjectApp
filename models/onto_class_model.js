import mongoose from 'mongoose';
const Schema = mongoose.Schema;

    const OntoClassSchema = new Schema({
	    name: { type: String, required: true },
	    date: { type: Date, required: true },
	    ontology: {type: Schema.Types.ObjectId, ref: 'Ontology'},
	    entities: [{type: Schema.Types.ObjectId, ref: 'Entity'}]
	},{ usePushEach: true });


module.exports = mongoose.model('Onto_Class', OntoClassSchema);