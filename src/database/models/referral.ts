import { Document, Schema, model, Types } from 'mongoose'
import * as timestamps from 'mongoose-timestamp'
import * as privatePaths from 'mongoose-private-paths'
import { IUserModel } from './user'


export interface IReferral {
    referredBy: IUserModel,
    referredUser: IUserModel,
    status: 'pending' | 'completed',
    approvedDate: any
}

const schema = new Schema({
    referredBy: { type: Schema.Types.ObjectId, ref: 'Users' },
    referredUser: { type: Schema.Types.ObjectId, ref: 'Users' },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    approvedDate: Date
})

schema.plugin(timestamps)
schema.plugin(privatePaths)

export type IReferralModel = IReferral & Document
export const Referral = model<IReferralModel>('Referral', schema)
export default Referral

