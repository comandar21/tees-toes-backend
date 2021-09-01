import * as mongoose from 'mongoose'
import * as debug from 'debug'
import * as Bluebird from 'bluebird'
import * as nconf from 'nconf'

const logger = debug('app:db')

// @ts-ignore
mongoose.Promise = Bluebird
// mongoose.set('debug', true)

export const open = (url?: string) => {
    return new Promise((resolve, reject) => {
        // Setup cache for mongoose
        // cachegoose(mongoose)
        console.log('opening mongodb connection')

        const options = {
            useCreateIndex: true,
            useNewUrlParser: true,
            useFindAndModify: false
        }

        mongoose.connect(nconf.get('DATABASE_URI'), options, (error: any) => {
            if (error) {
                console.log('please make sure mongodb is installed and running!')
                return reject(error)
            } else {
                console.log('mongodb is connected')
                resolve()
            }
        })
    })
}


export const close = () => mongoose.disconnect()
