import mongoose, { Schema, model, models } from 'mongoose';

export interface IRegistrationForm {
  _id?: string;
  userId?: string; // optional reference to User model (store id as string to avoid coupling)
  email?: string; // user's email at time of submission
  isFirstTime?: boolean; // whether this was collected on first registration
  posterImage?: Buffer; // raw image bytes
  posterMimeType?: string; // e.g. 'image/jpeg'
  posterFilename?: string;
  posterTakenAt?: Date;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

const RegistrationFormSchema = new Schema<IRegistrationForm>(
  {
    userId: { type: String, required: false, index: true },
    email: { type: String, required: false, trim: true, lowercase: true },
    isFirstTime: { type: Boolean, default: false },
    posterImage: { type: Buffer, required: false },
    posterMimeType: { type: String, required: false },
    posterFilename: { type: String, required: false },
    posterTakenAt: { type: Date, required: false },
    metadata: { type: Schema.Types.Mixed, required: false },
  },
  { timestamps: true }
);

// Add index to quickly find by user or email
RegistrationFormSchema.index({ userId: 1 });
RegistrationFormSchema.index({ email: 1 });

const RegistrationForm = (models.RegistrationForm as mongoose.Model< IRegistrationForm >) || model< IRegistrationForm >('RegistrationForm', RegistrationFormSchema);

export default RegistrationForm;
