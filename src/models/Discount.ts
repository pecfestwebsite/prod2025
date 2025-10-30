import mongoose, { Schema, model, models } from 'mongoose';

export interface IDiscount {
  _id?: string;
  discountCode: string;
  adminEmail: string;
  userEmail: string;
  eventName: string;
  eventId: string;
  discountAmount: number; // Amount to be deducted (in rupees)
  createdAt: Date;
  usedAt?: Date;
  isUsed: boolean;
}

const DiscountSchema = new Schema<IDiscount>(
  {
    discountCode: {
      type: String,
      required: [true, 'Discount code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    adminEmail: {
      type: String,
      required: [true, 'Admin email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: [true, 'User email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    eventName: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
      index: true,
    },
    eventId: {
      type: String,
      required: [true, 'Event ID is required'],
      trim: true,
      index: true,
    },
    discountAmount: {
      type: Number,
      required: [true, 'Discount amount is required'],
      min: [0, 'Discount amount must be positive'],
    },
    isUsed: {
      type: Boolean,
      default: false,
      index: true,
    },
    usedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Composite indexes for common queries
DiscountSchema.index({ userEmail: 1, eventId: 1 });
DiscountSchema.index({ discountCode: 1, userEmail: 1 });
DiscountSchema.index({ adminEmail: 1, createdAt: -1 });

const Discount = models.Discount || model<IDiscount>('Discount', DiscountSchema);

export default Discount;
