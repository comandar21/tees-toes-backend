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
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.PASS,
  },
});

const sendEmail = async (email, message) => {
  // await transporter.sendMail({
  //     from: process.env.EMAIL_ID,
  //     to: email,
  //     subject: "Maha Referral Program",
  //     text: `Congratulation you earned 1 MAHA`,
  //     html: `<b>Congratulation you earned 1 MAHA</b>`,
  // });

  const msg = {
    to: email, // Change to your recipient
    from: process.env.EMAIL_ID, // Change to your verified sender
    subject: 'Maha Referral Program',
    text: `${message}`,
    html: `<strong>${message}</strong>`,
  }
  console.log(msg);

  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent')
    })
    .catch((error) => {
      console.log('error', error.response.body)
    })
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
          await newReferral.save()
          User.updateOne({ _id: referredByUser._id }, { $inc: { mahaReferrals: 1 } }, {}, _.noop)
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
  try {
    const date = new Date()
    const userDetails = await User.findOne({ _id: req.body.id })
    let result = {}
    if (userDetails) {

      const client = new Twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: userDetails.twitter_oauth_access_token,
        access_token_secret: userDetails.twitter_oauth_access_token_secret
      });
      await client.get('friends/ids.json', async (error, response) => {
        if (error) {
          result = { error: error }
          console.log(error);
          // res.send(error)
        }

        else if (response && response.ids.includes(Number(process.env.TWITTER_MAHADAOID))) {
          userDetails.set('follow_twitter', true)
          await userDetails.save()

          const referralData = await Referral.findOne({ referredUser: userDetails._id })

          if (referralData) {
            const referredByUser = await User.findOne({ _id: referralData.referredBy })
            User.updateOne({ _id: referralData.referredBy }, { $inc: { mahaRewards: 1 } }, {}, _.noop)
            User.updateOne({ _id: referralData.referredUser }, { $inc: { mahaRewards: 1 } }, {}, _.noop)
            const senderMessage = `Yayyy! You have received 1 MAHA for referring ${userDetails.email} to MahaDAO.`
            const receiverMessage = `Yayyy! You have received 1 MAHA. `
            await sendEmail(referredByUser.email, senderMessage)
            await sendEmail(userDetails.email, receiverMessage)


            referralData.set('status', 'completed')
            referralData.set('approvedDate', date.toISOString())
            await referralData.save()
          }
        }
        result = {
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
          walletAddress: userDetails.walletAddress,
          mahaReferrals: userDetails.mahaReferrals,
          mahaRewards: userDetails.mahaRewards
        }
        // console.log(response.ids)
        console.log(result);

        res.send(result)
      });
    }
  } catch (e) {

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
  console.log('addEmailContractAddress');

  const checkEmailWalletAddress = await User
    .findOne({ $or: [{ email: req.body.email }, { walletAddress: req.body.walletAddress }] })
  if (checkEmailWalletAddress) {
    console.log('checkEmailWalletAddress');
    res.send({ success: false })
  }
  else {
    const checkUser = await User.findOne({ twitter_id: req.body.twitter_id })
    if (checkUser) {
      console.log('checkUser');
      checkUser.set('email', req.body.email)
      checkUser.set('walletAddress', req.body.walletAddress)
      await checkUser.save()
      const emailMessage = 'Welcome to MahaDAO Referral Program'
      console.log(emailMessage);

      await sendEmail(req.body.email, emailMessage)
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

export const getUser = async (req, res) => {
  const referralCode = req.body.referralCode
  const userDetails = await User.findOne({ referral_code: referralCode })
  if (userDetails) {
    res.send(userDetails.name)
  }
  else {
    res.send({ error: 'no user found' })
  }
}

export const getUserProfile = async (req, res) => {
  const twitterId = req.body.twitterId
  const userDetails = await User.findOne({ twitter_id: twitterId })
  if (userDetails) {
    delete userDetails.twitter_oauth_access_token
    delete userDetails.twitter_oauth_access_token_secret
    res.send(userDetails)
  }
  else {
    res.send({ error: 'no user found' })
  }
}

export const referralCSV = async (req, res) => {
  const csvWriter = createCsvWriter({
    path: 'TwitterAnalytic.csv',
    header: [
      { id: 'referredBy_ID', title: 'Reffered By ID' },
      { id: 'referredBy', title: 'Reffered By' },
      { id: 'referredUser_ID', title: 'Reffered User ID' },
      { id: 'referredUser', title: 'Reffered User' },
      { id: 'date', titlr: 'Date' }
      // { id: 'gender', title: 'Gender' },
    ]
  });
  let count = true
  const data = []

  const referrals = await Referral.find({ status: 'completed' })
    .populate({ path: 'referredUser', select: 'email name _id walletAddress twitter_id' })
    .populate({ path: 'referredBy', select: 'email name _id walletAddress twitter_id' })
  console.log(referrals.length);

  if (referrals.length > 0) {

    await Bluebird.mapSeries(referrals, async (referral) => {
      const referralData = {
        referredBy_ID: referral.referredBy._id,
        referredBy: referral.referredBy.name,
        referredUser_ID: referral.referredUser._id,
        referredUser: referral.referredUser.name,
        date: referral.approvedDate
      }

      data.push(referralData)
    })

    csvWriter
      .writeRecords(data)
      .then(() => console.log('The CSV file was written successfully'));

    res.send({ success: true })
  }
  res.send({ error: 'no referrals found' })
}
