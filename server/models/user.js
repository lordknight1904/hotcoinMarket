import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: 'String', required: true, unique: true },
  password: { type: 'String', required: true },
  salt: { type: 'String', default: '' },
  userName: { type: 'String', required: true, unique: true },

  emailVerified: {type: 'Boolean', default: false},
  dateSent: { type: Date, default: Date.now },

  addresses: [{
    coin: { type: 'String', required: true },
    address: { type: 'String', required: true },
    private: { type: 'String', required: true },
    public: { type: 'String', required: true },
    wif: { type: 'String', required: true },
  }],

  isSubmitting: {type: 'Boolean', default: false},
  approved: {type: 'Boolean', default: false},
  realName: {type: 'String', default: ''},
  phone: {type: 'String', default: ''},
  imageDir: {type: 'String', default: ''},
  isInform: {type: 'Boolean', default: false},
  requireInform: [{
    coin: { type: 'String', default: '' },
    min: { type: 'number', default: -1 },
    max: { type: 'number', default: -1 },
  }],

  proof: {type: 'String', default: false},
  googleAuthentication: { type: 'Boolean', default: false },
  googleSecret: { type: 'Object', default: '' },

  directHistory: [{
    coin: { type: 'String', default: '' },
    txHash: { type: 'String', default: '' },
  }],

  dateCreated: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
