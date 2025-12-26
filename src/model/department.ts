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
