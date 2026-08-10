import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  googleId: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  
  phone: { type: String },
  birthDate: { type: Date },
  address: { type: String },
  avatar: { type: String },

  preferences: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    reminderTime: { type: String, default: '24' }, // ore prima
    privacy: { type: String, enum: ['public', 'friends', 'private'], default: 'friends' },
    newsletter: { type: Boolean, default: true }
  }
}, {
  timestamps: true // Aggiunge automaticamente createdAt e updatedAt
});

export default mongoose.model("User", userSchema);
