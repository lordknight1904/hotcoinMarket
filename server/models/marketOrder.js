import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const marketOrderSchema = new Schema({
  createUser: { type: Schema.Types.ObjectId, ref: 'User', require: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', require: true },
  type: { type: 'String', require: true },
  coin: { type: 'String', require: true },
  rate: { type: 'number', require: true },
  min: { type: 'number', require: true },
  max: { type: 'number', require: true },
  amount: { type: 'number', default: 0 },
  transferRate: { type: 'number', default: 0 },
  transferCode: { type: 'String' },
  stage: { type: 'String', default: 'open' },
  accountNumber: { type: 'String', default: '' },
  accountName: { type: 'String', default: '' },
  bank: { type: Schema.Types.ObjectId, ref: 'Bank', require: true },
  // transactions: { type: Schema.Types.ObjectId, ref: 'Transaction' },
  evidenceDir: { type: 'String' },
  dateCreated: { type: Date, default: Date.now },
  dateSecond: { type: Date },
});
export default mongoose.model('MarketOrder', marketOrderSchema);
