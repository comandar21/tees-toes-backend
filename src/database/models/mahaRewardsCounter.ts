import { Document, Schema, model, Types } from 'mongoose'
import * as timestamps from 'mongoose-timestamp'
import * as privatePaths from 'mongoose-private-paths'


export interface IMahaReawardsCounter {
  count: number,
  startDate: any,
  endDate: any
}

const schema = new Schema({
  count: { type: Number, default: 1 },
  startDate: Date,
  endDate: Date
})

schema.plugin(timestamps)
schema.plugin(privatePaths)

export type IMahaReawardsCounterModel = IMahaReawardsCounter & Document
export const MahaReawardsCounter = model<IMahaReawardsCounterModel>('MahaReawardsCounter', schema)
export default MahaReawardsCounter

