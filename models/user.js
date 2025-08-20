const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true   // ek email se ek hi account banega
  },
  password: {
    type: String,
    required: true
  },
  profilePic: {
    type: String  // yaha file ka filename ya path save hoga
  }
});

module.exports = mongoose.model('UserSignup', userSchema);
