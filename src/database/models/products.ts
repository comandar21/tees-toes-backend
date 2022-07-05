import { Document, Schema, model, Types } from 'mongoose'
import * as timestamps from 'mongoose-timestamp'
import * as privatePaths from 'mongoose-private-paths'


export interface IProducts {
    name: string,
    price: number,
    quantity: number,
    description: string,
    image: string,
    code: string
}

const schema = new Schema({
    name: String,
    price: Number,
    quantity: { type: Number, default: 0 },
    description: String,
    image: String,
    code: String
})

schema.plugin(timestamps)
schema.plugin(privatePaths)

export type IProductsModel = IProducts & Document
export const Products = model<IProductsModel>('Products', schema)
export default Products