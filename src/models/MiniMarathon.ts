import mongoose, { Schema, model, models } from 'mongoose';

export interface IMiniMarathon {
    eventId: string;
    email: string;
    isPecStudent: boolean;
    dateTime: Date;
}

const MiniMarathonSchema = new Schema<IMiniMarathon>(
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
        dateTime: {
            type: Date,
            required: [true, 'Registration date and time is required'],
            default: Date.now,
        },
        isPecStudent: {
            type: Boolean,
            required: [true, 'Student type (PEC/Non-PEC) is required'],
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

// Add indexes for better query performance
MiniMarathonSchema.index({ eventId: 1, isPecStudent: 1 });
MiniMarathonSchema.index({ email: 1 });
MiniMarathonSchema.index({ eventId: 1, email: 1 }); // Composite index for unique registrations per event per email

// Prevent model recompilation in development (Next.js hot reload)
if (mongoose.models.MiniMarathon) {
    delete mongoose.models.MiniMarathon;
}

const MiniMarathon = model<IMiniMarathon>('MiniMarathon', MiniMarathonSchema);

export default MiniMarathon;
