import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    role: 'admin' | 'editor' | 'viewer';
    permissions: {
        canViewBilling: boolean;
        canManageProjects: boolean;
        canManageAlerts: boolean;
        canManageSettings: boolean;
        canSyncData: boolean;
    };
    lastLogin: Date;
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String },
    photoURL: { type: String },
    role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
    permissions: {
        canViewBilling: { type: Boolean, default: true },
        canManageProjects: { type: Boolean, default: false },
        canManageAlerts: { type: Boolean, default: false },
        canManageSettings: { type: Boolean, default: false },
        canSyncData: { type: Boolean, default: false },
    },
    lastLogin: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema);
