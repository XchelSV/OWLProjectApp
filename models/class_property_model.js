import mongoose from 'mongoose';
const Schema = mongoose.Schema;

    const ClassPropertySchema = new Schema({
	    name: { type: String, required: true },
	    date: { type: Date, required: true },
	    class: {type: Schema.Types.ObjectId, ref: 'Onto_Class'}
	},{ usePushEach: true });


module.exports = mongoose.model('Class_Property', ClassPropertySchema);