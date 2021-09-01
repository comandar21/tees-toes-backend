import { Document, Schema, model, Types } from 'mongoose'
import * as timestamps from 'mongoose-timestamp'
import * as privatePaths from 'mongoose-private-paths'

export interface IUser {
    avatar: string
    email: string
    jwt: string
    name: string
    phoneNumber: number
    gender: 'Male' | 'Female' | 'Other'
    dob: string
    country: string
}

const schema = new Schema({
    avatar: String,
    email: String,
    jwt: String,
    name: String,
    phoneNumber: Number,
    gender: String,
    dob: String,
    country: String
})

schema.plugin(timestamps)
schema.plugin(privatePaths)

export type IUserModel = IUser & Document
export const User = model<IUserModel>('Users', schema)
export default User

