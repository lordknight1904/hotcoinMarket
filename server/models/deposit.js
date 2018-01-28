import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const depositSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', require: true },
  value: { type: 'number', require: true },
  dateCreated: { type: Date, default: Date.now },
});

export default mongoose.model('Deposit', depositSchema);
