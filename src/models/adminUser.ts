import { number } from 'framer-motion';
import mongoose, { Schema, model, models } from 'mongoose';

export interface IAdmin {
  email: string;
  userId: string;
  accesslevel: number; // 0 - simple user, 1 - club/soc admin, 2 - super admin, 3 - webmaster
  clubsoc: string; // 13socs 15 clubs
  verified: boolean;
  name: string;
  dateTime: Date; // Date Added
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      unique: true,
    },
    userId: {
      type: String,
      required: [true, 'User ID is required, same as email for now'],
      trim: true,
    },
    name: {
      type: String,
      required: false,
      trim: true,
      default: 'Admin',
    },
    accesslevel: {
      type: Number,
      required: [true, 'Required'],
      default: 0,
    },
    verified: {
      type: Boolean,
      required: true,
      default: false,
    },
    clubsoc: {
      type: String,
      required: [true, 'From these 28 clubs/socs only'],
    },
    dateTime: {
      type: Date,
      required: [true, 'DateTime added'],
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Add indexes for better query performance
AdminSchema.index({ email: 1 });
AdminSchema.index({ userId: 1 });
AdminSchema.index({ userId: 1, accesslevel: 1 }); // Composite index for userId + accesslevel
AdminSchema.index({ verified: 1 });
AdminSchema.index({ accesslevel: 1 });

// Prevent model recompilation in development (Next.js hot reload)
const Admin = models.Admin || model<IAdmin>('Admin', AdminSchema);

export default Admin;
