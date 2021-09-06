import { Document, Schema, model, Types } from 'mongoose'
import * as timestamps from 'mongoose-timestamp'
import * as privatePaths from 'mongoose-private-paths'

export interface IUser {
    avatar: string,
    email: string,
    walletAddress: string,
    jwt: string,
    name: string,
    twitter_id: string,
    twitter_id_str: string,
    twitter_screen_name: string,
    twitter_followers: number,
    twitter_age: any,
    referral_link: string,
    referral_code: string,
    follow_twitter: boolean,
    follow_channel: boolean,
}

const schema = new Schema({
    avatar: String,
    email: String,
    walletAddress: String,
    jwt: String,
    name: String,
    twitter_id: String,
    twitter_id_str: String,
    twitter_screen_name: String,
    twitter_followers: { type: Number, default: 0 },
    twitter_age: Date,
    referral_link: String,
    referral_code: String,
    follow_twitter: { type: Boolean, default: false },
    follow_channel: { type: Boolean, default: false },
})

schema.plugin(timestamps)
schema.plugin(privatePaths)

export type IUserModel = IUser & Document
export const User = model<IUserModel>('Users', schema)
export default User

