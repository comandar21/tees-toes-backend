import { Document, Schema, model, Types } from 'mongoose'
import * as timestamps from 'mongoose-timestamp'
import * as privatePaths from 'mongoose-private-paths'

export interface ICategories {
    name: string,
    code: string
}

const schema = new Schema({
    name: String,
    code: String
})

schema.plugin(timestamps)
schema.plugin(privatePaths)

export type ICategoriesModel = ICategories & Document
export const Categories = model<ICategoriesModel>('Categories', schema)
export default Categories