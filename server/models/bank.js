import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const bankSchema = new Schema({
  name: { type: 'String', require: true },
  dateCreated: { type: Date, default: Date.now },
});

export default mongoose.model('Bank', bankSchema);
