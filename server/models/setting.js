import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const settingSchema = new Schema({
  name: { type: 'String', require: true },
  nameSort: { type: 'String', require: true },
  value: { type: 'String', require: true },
  disabled: { type: 'bool', default: false },
  dateCreated: { type: Date, default: Date.now },
});

export default mongoose.model('Setting', settingSchema);
