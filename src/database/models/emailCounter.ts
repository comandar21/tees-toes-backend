import { Document, Schema, model, Types } from 'mongoose'
import * as timestamps from 'mongoose-timestamp'
import * as privatePaths from 'mongoose-private-paths'


export interface IEmailCounter {
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

export type IEmailCounterModel = IEmailCounter & Document
export const EmailCounter = model<IEmailCounterModel>('EmailCounter', schema)
export default EmailCounter

