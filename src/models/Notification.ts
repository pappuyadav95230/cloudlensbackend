import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    uid: string;
    title: string;
    message: string;
    isRead: boolean;
    type: 'welcome' | 'alert' | 'billing' | 'system';
    createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
    uid: {
        type: String,
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['welcome', 'alert', 'billing', 'system'],
        default: 'system'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
