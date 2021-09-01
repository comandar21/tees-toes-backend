import User from '../database/models/user'

export const addUser = async (req, res) => {
    const newUser = new User({
        name: req.body.name,
        email: req.body.email
    })

    await newUser.save()

    res.send(newUser)
}