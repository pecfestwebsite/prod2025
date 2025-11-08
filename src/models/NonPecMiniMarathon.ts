import mongoose, { Schema, model, models } from 'mongoose';

export interface INonPecMiniMarathon {
  eventId: string;
  email: string;
  name: string;
  dateTime: Date;
}

const NonPecMiniMarathonSchema = new Schema<INonPecMiniMarathon>(
  {
    eventId: {
      type: String,
      required: [true, 'Event ID is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
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
NonPecMiniMarathonSchema.index({ eventId: 1 });
NonPecMiniMarathonSchema.index({ email: 1 });
NonPecMiniMarathonSchema.index({ eventId: 1, email: 1 }); // Composite index for unique registrations per event per email

// Prevent model recompilation in development (Next.js hot reload)
if (mongoose.models.NonPecMiniMarathon) {
  delete mongoose.models.NonPecMiniMarathon;
}

const NonPecMiniMarathon = model<INonPecMiniMarathon>('NonPecMiniMarathon', NonPecMiniMarathonSchema);

export default NonPecMiniMarathon;
