import mongoose, { Schema, model, models } from 'mongoose';

export interface IEvent {
  _id?: string;
  eventId: string;
  category: 'technical' | 'cultural' | 'convenor';
  societyName: string;
  additionalClub?: string;
  eventName: string;
  regFees: number;
  dateTime: Date;
  location: string;
  briefDescription: string;
  pdfLink?: string;
  image: string; // Firebase Storage URL
  mapCoordinates?: {
    latitude: number;
    longitude: number;
  };
  contactInfo: string;
  isTeamEvent: boolean;
  minTeamMembers: number;
  maxTeamMembers: number;
  team?: number;
  teamLimit?: number;
}

const EventSchema = new Schema<IEvent>(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
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
    additionalClub: {
      type: String,
      default: 'None',
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
      default: '',
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      // This will store Firebase Storage URL
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
    isTeamEvent: {
      type: Boolean,
      required: [true, 'Team/Individual setting is required'],
      default: false,
    },
    minTeamMembers: {
      type: Number,
      required: [true, 'Minimum team members is required'],
      min: [1, 'Minimum team members must be at least 1'],
    },
    maxTeamMembers: {
      type: Number,
      required: [true, 'Maximum team members is required'],
      min: [1, 'Maximum team members must be at least 1'],
    },
    // Legacy fields - kept for backwards compatibility but not required
    team: {
      type: Number,
      default: undefined,
    },
    teamLimit: {
      type: Number,
      default: undefined,
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

// Helper function to generate eventId
function generateEventId(eventName: string, societyName: string, additionalClub?: string): string {
  console.log('🔧 generateEventId called with:', { eventName, societyName, additionalClub });
  
  try {
    const eventNameSlug = eventName
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    
    const societyNameSlug = societyName
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    
    const additionalClubSlug = additionalClub && additionalClub !== 'None'
      ? additionalClub
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '')
      : null;
    
    // Build eventId: eventname_society or eventname_society_additionalclub
    const result = additionalClubSlug
      ? `${eventNameSlug}_${societyNameSlug}_${additionalClubSlug}`
      : `${eventNameSlug}_${societyNameSlug}`;
    
    console.log('🔧 generateEventId result:', result);
    return result;
  } catch (error) {
    console.error('❌ Error generating eventId:', error);
    return `EVT${Date.now().toString().slice(-5)}`;
  }
}

// IMPORTANT: Only the validate hook should generate eventId, not save
EventSchema.pre('validate', function (this: mongoose.Document & IEvent, next) {
  console.log('🔍 validate hook - isNew:', this.isNew, 'eventId:', this.eventId);
  
  if (this.isNew && !this.eventId) {
    this.eventId = generateEventId(this.eventName, this.societyName, this.additionalClub);
    console.log('✅ validate hook - Generated eventId:', this.eventId);
  }
  next();
});

// Prevent model recompilation in development (Next.js hot reload)
const Event = models.Event || model<IEvent>('Event', EventSchema);

export default Event;
