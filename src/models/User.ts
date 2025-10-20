import mongoose, { Schema, model, models } from 'mongoose';
import { nanoid } from 'nanoid';

export interface IUser {
  userId: string;
  email: string;
  name?: string;
  college?: string;
  studentId?: string;
  phoneNumber?: string;
  referralCode?: string;
  branch?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  loginCount: number;
}

const UserSchema = new Schema<IUser>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => nanoid(16),
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: false,
      trim: true,
    },
    college: {
      type: String,
      required: false,
      trim: true,
    },
    studentId: {
      type: String,
      required: false,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: false,
      trim: true,
    },
    referralCode: {
      type: String,
      required: false,
      trim: true,
    },
    branch: {
      type: String,
      required: false,
      trim: true,
    },
    lastLoginAt: {
      type: Date,
      required: false,
    },
    loginCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User = models.User || model<IUser>('User', UserSchema);

export default User;


