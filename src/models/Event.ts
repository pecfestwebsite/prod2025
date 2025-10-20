import mongoose, { Schema, model, models } from 'mongoose';

export interface IEvent {
  _id?: string;
  eventId: string;
  category: 'technical' | 'cultural' | 'convenor';
  societyName: string;
  eventName: string;
  regFees: number;
  dateTime: Date;
  location: string;
  briefDescription: string;
  pdfLink: string;
  image: string; // base64url
  mapCoordinates?: {
    latitude: number;
    longitude: number;
  };
  contactInfo: string;
  team: number;
  teamLimit: number;
}

// Counter schema for auto-incrementing eventId
const CounterSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  sequence_value: {
    type: Number,
    default: 0,
  },
});

const Counter = models.Counter || model('Counter', CounterSchema);

const EventSchema = new Schema<IEvent>(
  {
    eventId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: undefined,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['technical', 'cultural', 'convenor'],
        message: 'Category must be either technical, cultural, or convenor',
      },
    },
    societyName: {
      type: String,
      required: [true, 'Society name is required'],
      trim: true,
    },
    eventName: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
    },
    regFees: {
      type: Number,
      required: [true, 'Registration fees is required'],
      min: [0, 'Registration fees cannot be negative'],
    },
    dateTime: {
      type: Date,
      required: [true, 'Date and time is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    briefDescription: {
      type: String,
      required: [true, 'Brief description is required'],
      trim: true,
    },
    pdfLink: {
      type: String,
      required: [true, 'PDF link is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      // This will store base64url encoded image
    },
    mapCoordinates: {
      type: {
        latitude: {
          type: Number,
          required: true,
          min: -90,
          max: 90,
        },
        longitude: {
          type: Number,
          required: true,
          min: -180,
          max: 180,
        },
      },
      required: false,
      _id: false, // Prevent mongoose from creating _id for subdocument
    },
    contactInfo: {
      type: String,
      required: [true, 'Contact info is required'],
      trim: true,
    },
    team: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Team count cannot be negative'],
    },
    teamLimit: {
      type: Number,
      required: [true, 'Team limit is required'],
      min: [0, 'Team limit cannot be negative'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Add indexes for better query performance
EventSchema.index({ eventId: 1 });
EventSchema.index({ category: 1 });
EventSchema.index({ dateTime: 1 });

// Generate eventId before any middleware runs (most critical)
EventSchema.pre('save', async function (next) {
  if (this.isNew && !this.eventId) {
    try {
      // Get and increment the counter
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'eventId' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      
      // Generate eventId from counter
      if (counter && counter.sequence_value) {
        this.eventId = `EVT${String(counter.sequence_value).padStart(5, '0')}`;
      } else {
        throw new Error('Failed to generate counter');
      }
    } catch (error) {
      console.error('Error generating eventId in save hook:', error);
      // Use timestamp-based fallback
      this.eventId = `EVT${Date.now().toString().slice(-5)}`;
    }
  }
  next();
});

// Auto-generate eventId before validation (backup)
EventSchema.pre('validate', async function (next) {
  if (this.isNew && !this.eventId) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'eventId' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      
      if (counter && counter.sequence_value) {
        this.eventId = `EVT${String(counter.sequence_value).padStart(5, '0')}`;
      } else {
        throw new Error('Failed to get counter value');
      }
    } catch (error) {
      console.error('Error generating eventId in validate hook:', error);
      // Fallback: use timestamp-based ID
      this.eventId = `EVT${Date.now().toString().slice(-5)}`;
    }
  }
  next();
});

// Prevent model recompilation in development (Next.js hot reload)
const Event = models.Event || model<IEvent>('Event', EventSchema);

export default Event;
