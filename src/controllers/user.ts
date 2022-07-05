import Users from '../database/models/user'
import * as jwt from 'jsonwebtoken'

let accessTokenSecret = process.env.JWT_SECRET

export const user = async (req: any, res: any) => {
  const user = req.body
  const checkUser = await Users.findOne({ email: user.email })
  if (checkUser) {
    // const accessToken = jwt.sign({ _id: checkUser.id || checkUser._id }, accessTokenSecret)
    // checkUser.set('jwt', accessToken)
    // await checkUser.save()
    res.send(checkUser)
  }
  else {
    const newUser = new Users({
      name: user.name || '',
      email: user.email,
      username: user.username,
    })
    await newUser.save()
    // const accessToken = jwt.sign({ _id: newUser.id || newUser._id }, accessTokenSecret)
    // newUser.set('jwt', accessToken)
    res.send(newUser)
  }
}