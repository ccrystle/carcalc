import mongoose, { Document, Schema } from 'mongoose';

export interface IContent extends Document {
    key: string;
    content: string;
    updatedAt: Date;
}

const ContentSchema: Schema = new Schema({
    key: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IContent>('Content', ContentSchema);
