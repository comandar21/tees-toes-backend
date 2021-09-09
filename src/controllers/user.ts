require('dotenv').config()
import User from '../database/models/user'
import Referral from '../database/models/referral'
import * as Bluebird from 'bluebird'
import * as jwt from 'jsonwebtoken'
import fetch from 'node-fetch';
const oauthCallback = process.env.FRONTEND_URL;
const oauth = require('../library/oauth-promise')(oauthCallback);
const COOKIE_NAME = 'oauth_token';
const accessTokenSecret = process.env.JWT_SECRET
const Twitter = require('twitter');
import * as _ from 'underscore'
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.PASS,
    },
});

const sendEmail = async (email) => {
    await transporter.sendMail({
        from: process.env.EMAIL_ID,
        to: email,
        subject: "Maha Referral Program",
        text: `Congratulation you earned 1 MAHA`,
        html: `<b>Congratulation you earned 1 MAHA</b>`,
    });
}

const getRandomString = () => {
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}


export const twitterSignUp = async (data, oauth_access_token, oauth_access_token_secret, referCode) => {
    try {
        const checkUser = await User.findOne({ twitter_id: String(data.id) }).populate('')
        //1246916938678169600
        if (checkUser === null) {

            const token = jwt.sign({ twitter_id: String(data.id) }, accessTokenSecret)

            const referralCode = await getRandomString()
            const newUser = new User({
                name: data.name,
                twitter_id: data.id,
                twitter_id_str: data.id_str,
                twitter_screen_name: data.screen_name,
                twitter_followers: data.followers_count,
                twitter_age: new Date(data.created_at).toISOString(),
                referral_link: `${process.env.REDIRECT_URL}/${referralCode}`,
                referral_code: referralCode,
                jwt: token,
                twitter_oauth_access_token: oauth_access_token,
                twitter_oauth_access_token_secret: oauth_access_token_secret,
            })
            await newUser.save()

            if (referCode !== '') {
                const referredByUser = await User.findOne({ referral_code: referCode }).populate('')
                if (referredByUser) {
                    const newReferral = new Referral({
                        referredBy: referredByUser._id,
                        referredUser: newUser._id
                    })
                }
            }
            // const twitterMahaFollow = await checkMahaTwitterFollow(oauth_access_token, oauth_access_token_secret, newUser._id)
            return newUser
        }
        else {
            const token = jwt.sign({ twitter_id: checkUser.id }, accessTokenSecret)
            checkUser.set('jwt', token)
            checkUser.set('twitter_oauth_access_token', oauth_access_token)
            checkUser.set('twitter_oauth_access_token_secret', oauth_access_token_secret)
            await checkUser.save()
            // const twitterMahaFollow = await checkMahaTwitterFollow(oauth_access_token, oauth_access_token_secret, checkUser._id)

            return checkUser
        }
    } catch (e) {
        console.log(e)
    }
}

export const checkMahaFollow = async (req, res) => {
    // const user= req.user
    const userDetails = await User.findOne({ _id: req.body.id })

    if (userDetails) {

        const client = new Twitter({
            consumer_key: process.env.TWITTER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
            access_token_key: userDetails.twitter_oauth_access_token,
            access_token_secret: userDetails.twitter_oauth_access_token_secret
        });
        await client.get('friends/ids.json', async (error, response) => {
            if (error) {
                console.log(error);
                res.send(error)
            }

            if (response && response.ids.includes(Number(process.env.TWITTER_MAHADAOID))) {
                userDetails.set('follow_twitter', true)
                await userDetails.save()

                const referralData = await Referral.findOne({ referredUser: userDetails._id })

                if (referralData) {
                    const referredByUser = await User.findOne({ _id: referralData.referredBy })
                    User.updateOne({ _id: referralData.referredBy }, { $inc: { mahaRewards: 1 } }, {}, _.noop)
                    User.updateOne({ _id: referralData.referredUser }, { $inc: { mahaRewards: 1 } }, {}, _.noop)

                    await sendEmail(referredByUser.email)
                    await sendEmail(userDetails.email)


                    referralData.set('status', 'completed')
                    await referralData.save()
                }
            }
            else {
                console.log(error)
            }
            // console.log(response.ids)
        });
        res.send({
            _id: userDetails.id,
            follow_twitter: userDetails.follow_twitter,
            follow_channel: userDetails.follow_channel,
            twitter_followers: userDetails.twitter_followers,
            name: userDetails.name,
            twitter_id: userDetails.twitter_id,
            twitter_id_str: userDetails.twitter_id_str,
            twitter_screen_name: userDetails.twitter_screen_name,
            twitter_age: userDetails.twitter_age,
            referral_link: userDetails.referral_link,
            referral_code: userDetails.referral_code,
            jwt: userDetails.jwt,
            email: userDetails.email,
            walletAddress: userDetails.walletAddress
        })
    }
}

export const twitterSignIn = async (req, res) => {
    const checkUser = await User.findOne({ email: req.body.email, twitterId: req.body.twitterId })
    if (checkUser) {
        res.send({
            success: true,
            token: checkUser.jwt
        })
    }
    else {
        res.send({ error: 'not a valid user' })
    }
}

export const editProfile = async (req, res) => {
    const user = req.user
    const checkUser = await User.findOne({ twitter_id: user.twitter_id })
    if (checkUser) {
        checkUser.set('follow_twitter', req.body.follow_twitter || checkUser.follow_twitter)
        checkUser.set('follow_channel', req.body.follow_channel || checkUser.follow_channel)

        await checkUser.save()
        res.send(checkUser)
    }
    else {
        res.send({ error: 'cannot find user' })
    }
}

export const addEmailContractAddress = async (req, res) => {
    const checkUser = await User.findOne({ twitter_id: req.body.twitter_id })
    if (checkUser) {
        checkUser.set('email', req.body.email)
        checkUser.set('walletAddress', req.body.walletAddress)
        await checkUser.save()
        if (req.body.referralCode) {
            const checkReferredBy = await User.findOne({ referral_code: req.body.referralCode })
            if (checkReferredBy) {
                const newReferral = new Referral({
                    referredBy: checkReferredBy.id,
                    referredUser: checkUser.id
                })
                await newReferral.save()
            }
        }
        res.send(checkUser)
    }
    else {
        res.send({ error: 'cannot find user' })
    }
}

export const referralList = async (req, res) => {
    const user = req.user
    const checkUser = await User.findOne({ referral_code: user.twitter_id })
    if (checkUser) {
        const referralUsers = await Referral
            .find({ referredBy: checkUser.id })
            .populate({ path: 'referredUser', select: 'email' })
        res.send(referralUsers)
    }
    else {
        res.send({ error: 'user not found' })
    }
}
