import mongoose from 'mongoose';
const Schema = mongoose.Schema;
require('mongoose-long')(mongoose);

const marketOrderSchema = new Schema({
  createUser: { type: Schema.Types.ObjectId, ref: 'User', require: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', require: true },
  type: { type: 'String', require: true },
  coin: { type: 'String', require: true },
  rate: { type: 'number', require: true },
  min: { type: Schema.Types.Long, require: true },
  max: { type: Schema.Types.Long, require: true },
  amount: { type: 'number', default: 0 },
  transferRate: { type: 'number', default: 0 },
  transferCode: { type: 'String' },
  stage: { type: 'String', default: 'open' },
  conflict: { type: Boolean, default: false },
  accountNumber: { type: 'String', default: '' },
  accountName: { type: 'String', default: '' },
  bank: { type: Schema.Types.ObjectId, ref: 'Bank', require: true },
  // transactions: { type: Schema.Types.ObjectId, ref: 'Transaction' },
  evidenceDir: { type: 'String' },
  txHash: { type: 'String' },
  txHashFee: { type: 'String' },
  fee: { type: 'number' },
  feeNetwork: { type: 'number' },
  feeTrade: { type: 'number' },
  feeTradeAdmin: { type: 'number' },
  dateCreated: { type: Date, default: Date.now },
  dateSecond: { type: Date },
  dateThird: { type: Date },
  dateDone: { type: Date },
});
export default mongoose.model('MarketOrder', marketOrderSchema);
