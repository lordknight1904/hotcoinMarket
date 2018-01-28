import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const rateSchema = new Schema({
  coin: { type: 'String', require: true },
  last: { type: 'number' },
  high: { type: 'number' },
  low: { type: 'number' },
});

export default mongoose.model('Rate', rateSchema);
