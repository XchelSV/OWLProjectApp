import mongoose from 'mongoose';
const Schema = mongoose.Schema;

    const RelationSchema = new Schema({
	    subject: {type: Schema.Types.ObjectId, ref: 'Entity'},
	    verb: { type: String, required: true },
	    complement: {type: Schema.Types.ObjectId, ref: 'Entity'},
	    ontology: {type: Schema.Types.ObjectId, ref: 'Ontology'},
	    date: { type: Date, required: true },
	});


module.exports = mongoose.model('Relation', RelationSchema);