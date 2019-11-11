import mongoose from 'mongoose';
const Schema = mongoose.Schema;
	
	const PropVal = new Schema({
		property: {type: Schema.Types.ObjectId, ref: 'Class_Property'},
		val: { type: String, required: true }
	})

    const EntitySchema = new Schema({
    	name: { type: String, required: true },
	    date: { type: Date, required: true },
	    class: {type: Schema.Types.ObjectId, ref: 'Onto_Class'},
	    properties: [PropVal]
	},{ usePushEach: true });


module.exports = mongoose.model('Entity', EntitySchema);