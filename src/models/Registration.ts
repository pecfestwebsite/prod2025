import mongoose, { Schema, model, models } from 'mongoose';

export interface IRegistration {
  eventId: string;
  userId: string;
  teamUserIds: string[];
  verified: boolean;
  feesPaid: string; // base64url
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
    teamUserIds: {
      type: [String],
      required: [true, 'Team user IDs array is required'],
      default: [],
    },
    verified: {
      type: Boolean,
      required: true,
      default: false,
    },
    feesPaid: {
      type: String,
      required: [true, 'Fees paid receipt is required'],
      // This will store base64url encoded image/document
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
RegistrationSchema.index({ eventId: 1, userId: 1 }); // Composite index for unique registrations per event per user
RegistrationSchema.index({ verified: 1 });

// Prevent model recompilation in development (Next.js hot reload)
const Registration = models.Registration || model<IRegistration>('Registration', RegistrationSchema);

export default Registration;
