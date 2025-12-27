import mongoose, { Schema, Document } from 'mongoose';
import { DepartmentInterface } from '../types/department.interface';

export interface DepartmentDocument extends DepartmentInterface, Document { }

const DepartmentSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        description: {
            type: String
        },
        managerId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        headId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: false }
    }
);

export default mongoose.model<DepartmentDocument>(
    'Department',
    DepartmentSchema
);
