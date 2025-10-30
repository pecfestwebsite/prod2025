import mongoose, { Schema, model, models } from 'mongoose';

export interface IRegistration {
  eventId: string;
  userId: string;
  teamId: string;
  verified: boolean;
  feesPaid?: string; // Firebase Storage URL (empty for free events)
  discount: number; // Discount amount in rupees, default 0
  accommodationRequired: boolean; // Whether accommodation is needed
  accommodationMembers: number; // Number of members needing accommodation
  accommodationFees: number; // Total accommodation fees (members * 1500)
  totalFees: number; // Total fees (event fees + accommodation fees - discount)
  dateTime: Date;
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    eventId: {
      type: String,
      required: [true, 'Event ID is required'],
      trim: true,
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      trim: true,
    },
    teamId: {
      type: String,
      required: false,
      trim: true,
      default: '',
    },
    verified: {
      type: Boolean,
      required: true,
      default: false,
    },
    feesPaid: {
      type: String,
      default: '',
      // This will store Firebase Storage URL of payment receipt
    },
    discount: {
      type: Number,
      required: false,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    accommodationRequired: {
      type: Boolean,
      required: false,
      default: false,
    },
    accommodationMembers: {
      type: Number,
      required: false,
      default: 0,
      min: [0, 'Members cannot be negative'],
    },
    accommodationFees: {
      type: Number,
      required: false,
      default: 0,
      min: [0, 'Accommodation fees cannot be negative'],
      // Calculated as: accommodationMembers * 1500
    },
    totalFees: {
      type: Number,
      required: false,
      default: 0,
      min: [0, 'Total fees cannot be negative'],
      // Calculated as: (eventFees + accommodationFees - discount)
    },
    dateTime: {
      type: Date,
      required: [true, 'Registration date and time is required'],
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Add indexes for better query performance
RegistrationSchema.index({ eventId: 1 });
RegistrationSchema.index({ userId: 1 });
RegistrationSchema.index({ teamId: 1 });
RegistrationSchema.index({ eventId: 1, userId: 1 }); // Composite index for unique registrations per event per user
RegistrationSchema.index({ verified: 1 });

// Prevent model recompilation in development (Next.js hot reload)
// Force delete existing model to ensure schema updates are applied
if (mongoose.models.Registration) {
  delete mongoose.models.Registration;
}

const Registration = model<IRegistration>('Registration', RegistrationSchema);

export default Registration;
