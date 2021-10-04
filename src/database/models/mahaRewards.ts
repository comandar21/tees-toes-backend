import { Document, Schema, model, Types } from 'mongoose'
import * as timestamps from 'mongoose-timestamp'
import * as privatePaths from 'mongoose-private-paths'
import { IUserModel } from './user'


export interface IMahaRewards {
  uid: IUserModel,
  noOfToken: number,
  status: 'pending' | 'paid',
  action: 'referral' | 'governance' | 'twitter-referral' | 'governance-referral'
}

const schema = new Schema({
  uid: { type: Schema.Types.ObjectId, ref: 'Users' },
  noOfToken: Number,
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  action: String
})

schema.plugin(timestamps)
schema.plugin(privatePaths)

export type IMahaRewardsModel = IMahaRewards & Document
export const MahaRewards = model<IMahaRewardsModel>('MahaRewards', schema)
export default MahaRewards

