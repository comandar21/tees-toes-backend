import { Document, Schema, model, Types } from 'mongoose'
import * as timestamps from 'mongoose-timestamp'
import * as privatePaths from 'mongoose-private-paths'


export interface IUser {
  username: string,
  name: string
  avatar: string
  dob: string,
  gender: 'Male' | 'Female' | 'Other'
  email: string
  phoneNumber: number
  postalAddress: string
  city: string
  country: string,
  role: 'user' | 'admin'
  jwt: string
}


const schema = new Schema({
  username: { type: String },
  name: String,
  avatar: String,
  dob: String,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  email: String,
  phoneNumber: { type: Number },
  postalAddress: String,
  city: String,
  country: String,
  jwt: { type: String, private: true },
  role: { type: String, enum: ['user', 'admin'] },
})

schema.plugin(timestamps)
schema.plugin(privatePaths)

export type IUserModel = IUser & Document
export const User = model<IUserModel>('Users', schema)
export default User