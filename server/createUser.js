// createUser.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const createUser = async (email, password) => {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Hash password manually to match your model's pre-save hook
  const hashedPassword = await bcrypt.hash(password, 8);
  
  await User.create({
    email,
    password: hashedPassword
  });
  
  console.log('User created successfully');
  mongoose.disconnect();
};

// Usage: node createUser.js email@example.com password
createUser(process.argv[2], process.argv[3]);