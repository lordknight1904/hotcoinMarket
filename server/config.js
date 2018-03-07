const config = {
  mongoURL: process.env.MONGO_URL || 'mongodb://localhost:27017/diginex',
  port: process.env.PORT || 9000,

};

export default config;
