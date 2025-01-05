const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Use UUID to generate unique user IDs

// Define the schema for users
const userSchema = new mongoose.Schema({
  idUser: { 
    type: String, 
    required: true, 
    unique: true, 
    default: uuidv4, // Automatically generate a unique id if not provided
  },
  NameUser: { 
    type: String, 
    required: true, 
    trim: true, // Ensure no extra spaces
  },
  sexeUser: { 
    type: String, 
    enum: ['Male', 'Female', 'Other'], // Enforcing some structure for gender
    default: 'Other', // Default to 'Other' if not specified
  },
  EmailUser: { 
    type: String, 
    unique: true, 
    required: true, 
    lowercase: true, 
    trim: true, // Ensure emails are stored in lowercase and trimmed
  },
  roleUser: { 
    type: String, 
    enum: ['user', 'admin'], // Define possible roles
    default: 'user', // Default role is 'user'
  },

  password: { 
    type: String, 
    required: true, 
  },
  resetToken: { 
    type: String, 
    default: undefined, // Set default as undefined to avoid errors
  },
  resetTokenExpiry: { 
    type: Date, 
    default: undefined, // Set default as undefined to avoid errors
  },
}, { timestamps: true }); // Optional: Adds createdAt and updatedAt timestamps

// Create and export the model
module.exports = mongoose.model('User', userSchema);
