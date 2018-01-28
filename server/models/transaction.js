import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: 'User', require: true },
  to: { type: Schema.Types.ObjectId, ref: 'User', require: true },
  coin: { type: 'String', require: true },
  amount: { type: 'number', require: true },
  price: { type: 'number', require: true },
  feeCoin: { type: 'number', require: true },
  feeUsdt: { type: 'number', require: true },
  txCoin: { type: 'String', require: true },
  dateCreated: { type: Date, default: Date.now },
});

export default mongoose.model('Transaction', transactionSchema);
