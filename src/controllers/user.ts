require('dotenv').config()
import User from '../database/models/user'
import EmailCounter from '../database/models/emailCounter'
import MahaRewardsCounter from '../database/models/mahaRewardsCounter'

import Referral from '../database/models/referral'
import MahaRewards from '../database/models/mahaRewards'
import * as Bluebird from 'bluebird'
import * as jwt from 'jsonwebtoken'
import fetch from 'node-fetch';
import * as _ from 'underscore'
import { log } from 'console'

const request = require('request');

const secretKey = process.env.RECAPTCHA_SECRETE_KEY
const oauthCallback = process.env.FRONTEND_URL;
const accessTokenSecret = process.env.JWT_SECRET

const oauth = require('../library/oauth-promise')(oauthCallback);
const COOKIE_NAME = 'oauth_token';
const Twitter = require('twitter');
const nodemailer = require("nodemailer");
const bluebird = require("bluebird")
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

const emailCounter = async () => {
  let result = false
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const newFirstDay = firstDay.setDate(firstDay.getDate() + 1)
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const newLastDay = lastDay.setDate(lastDay.getDate() + 1)

  const emailCount = await EmailCounter
    .findOne({ $and: [{ startDate: new Date(newFirstDay).toISOString() }, { endDate: new Date(newLastDay).toISOString() }] })

  if (emailCount) {
    if (emailCount.count > 100000) {
      return result
    }
    else {
      result = true
      emailCount.set('count', emailCount.count + 1)
      await emailCount.save()
      return result
    }
  }
  else {
    const newEmailCounter = new EmailCounter({
      startDate: firstDay.toISOString(),
      endDate: lastDay.toISOString()
    })
    result = true
    await newEmailCounter.save()
    return result
  }
}

const rewardsCounter = async () => {
  let result = false
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const newFirstDay = firstDay.setDate(firstDay.getDate() + 1)
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const newLastDay = lastDay.setDate(lastDay.getDate() + 1)

  const rewardsCount = await MahaRewardsCounter
    .findOne({ $and: [{ startDate: new Date(newFirstDay).toISOString() }, { endDate: new Date(newLastDay).toISOString() }] })

  if (rewardsCount) {
    if (rewardsCount.count > 5000) {
      return result
    }
    else {
      result = true
      rewardsCount.set('count', rewardsCount.count + 0.1)
      await rewardsCount.save()
      return result
    }
  }
  else {
    const newMahaRewardsCounter = new MahaRewardsCounter({
      startDate: firstDay.toISOString(),
      endDate: lastDay.toISOString()
    })
    result = true
    await newMahaRewardsCounter.save()
    return result
  }
}

const sendEmail = async (emailData, templateId) => {
  // await transporter.sendMail({
  //     from: process.env.EMAIL_ID,
  //     to: email,
  //     subject: "Maha Referral Program",
  //     text: `Congratulation you earned 1 MAHA`,
  //     html: `<b>Congratulation you earned 1 MAHA</b>`,
  // });
  try {

    const msg = {
      to: emailData.to_email, // Change to your recipient
      from: "noreply@mahareferrals.xyz", // Change to your verified sender
      subject: "Maha Referral Program",
      // text: `${message}`,
      templateId: templateId,
      dynamic_template_data: emailData
      // html: `<strong>${message}</strong>`,
    }

    sgMail
      .send(msg)
      .then(() => {
      })
      .catch((error) => {
      })
  } catch (e) {

  }

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
          newUser.set('referredBy', referredByUser.referral_code)
          await newUser.save()
          // const result = await User.updateOne({ _id: referredByUser._id }, { $inc: { mahaReferrals: 1 } }, {}, _.noop)
        }
      }
      const newUserProfile = {
        _id: newUser.id,
        follow_twitter: newUser.follow_twitter,
        follow_channel: newUser.follow_channel,
        twitter_followers: newUser.twitter_followers,
        name: newUser.name,
        twitter_id: newUser.twitter_id,
        twitter_id_str: newUser.twitter_id_str,
        twitter_screen_name: newUser.twitter_screen_name,
        twitter_age: newUser.twitter_age,
        referral_link: newUser.referral_link,
        referral_code: newUser.referral_code,
        jwt: newUser.jwt,
        email: newUser.email,
        walletAddress: newUser.walletAddress,
        mahaReferrals: newUser.mahaReferrals,
        mahaRewards: newUser.mahaRewards,
        referredBy: newUser.referredBy || ''
      }
      // const twitterMahaFollow = await checkMahaTwitterFollow(oauth_access_token, oauth_access_token_secret, newUser._id)
      return newUserProfile
    }
    else {
      const token = jwt.sign({ twitter_id: checkUser.twitter_id }, accessTokenSecret)
      checkUser.set('jwt', token)
      checkUser.set('twitter_oauth_access_token', oauth_access_token)
      checkUser.set('twitter_oauth_access_token_secret', oauth_access_token_secret)
      await checkUser.save()
      // const twitterMahaFollow = await checkMahaTwitterFollow(oauth_access_token, oauth_access_token_secret, checkUser._id)

      const checkUserProfile = {
        _id: checkUser.id,
        follow_twitter: checkUser.follow_twitter,
        follow_channel: checkUser.follow_channel,
        twitter_followers: checkUser.twitter_followers,
        name: checkUser.name,
        twitter_id: checkUser.twitter_id,
        twitter_id_str: checkUser.twitter_id_str,
        twitter_screen_name: checkUser.twitter_screen_name,
        twitter_age: checkUser.twitter_age,
        referral_link: checkUser.referral_link,
        referral_code: checkUser.referral_code,
        jwt: checkUser.jwt,
        email: checkUser.email,
        walletAddress: checkUser.walletAddress,
        mahaReferrals: checkUser.mahaReferrals,
        mahaRewards: checkUser.mahaRewards,
        referredBy: checkUser.referredBy || ''

      }
      return checkUserProfile
    }
  } catch (e) {
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
          // res.send(error)
        }

        else if (response && response.ids.includes(Number(process.env.TWITTER_MAHADAOID))) {
          userDetails.set('follow_twitter', true)
          await userDetails.save()

          const referralData = await Referral.findOne({ referredUser: userDetails._id })

          if (referralData) {
            const referredByUser = await User.findOne({ _id: referralData.referredBy })

            // const checkMahaRewards= await rewardsCounter()
            // if(checkMahaRewards){
            //   // User.updateOne({ _id: referralData.referredBy }, { $inc: { mahaRewards: 0.1 } }, {}, _.noop)
            // }
            // const checkMahaRewards1= await rewardsCounter()
            // if(checkMahaRewards1){
            //   // User.updateOne({ _id: referralData.referredUser }, { $inc: { mahaRewards: 0.1 } }, {}, _.noop)
            // }

            const referrerData = {
              first_name: referredByUser.name,
              referee_name: userDetails.name,
              to_email: referredByUser.email
            }
            const refereeData = {
              first_name: userDetails.name,
              referrer_name: referredByUser.name,
              to_email: userDetails.email
            }
            // const newMahaReward = new MahaRewards({
            //   uid: userDetails._id,
            //   noOfToken: 1,
            //   action: 'twitter-referral'
            // })
            // await newMahaReward.save()
            // const newreferredByUserMahaReward = new MahaRewards({
            //   uid: referredByUser._id,
            //   noOfToken: 1,
            //   action: 'referral'
            // })
            // await newreferredByUserMahaReward.save()
            const checkEmailCounter = await emailCounter()
            // if (checkEmailCounter) {
            //   // Referral completes a task
            //   await sendEmail(referrerData, 'd-46b96f5b08c84f6a9dcfb66fa5b5d080')
            //   // For the referred person
            //   await sendEmail(refereeData, 'd-d3d7ec51fcbb43cca6abed30d27b4db4')
            //   // await sendEmail(referrerData, 'd-27034206b677427eaecf6ddf3e8ff95a')
            //   // await sendEmail(refereeData, 'd-ac15ca6f15024b5588224b78956af899')
            // }
            // else {
            //   res.send({ message: 'email limit exceded' })
            // }

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
          mahaRewards: userDetails.mahaRewards,
          referredBy: userDetails.referredBy || ''
        }

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
  const checkUser = await User.findOne({ twitter_id: req.body.twitter_id })
  if (checkUser) {
    checkUser.set('follow_twitter', req.body.follow_twitter || checkUser.follow_twitter)
    checkUser.set('follow_channel', req.body.follow_channel || checkUser.follow_channel)
    checkUser.set('walletAddress', req.body.walletAddress || checkUser.walletAddress)

    await checkUser.save()

    const userProfile = {
      _id: checkUser.id,
      follow_twitter: checkUser.follow_twitter,
      follow_channel: checkUser.follow_channel,
      twitter_followers: checkUser.twitter_followers,
      name: checkUser.name,
      twitter_id: checkUser.twitter_id,
      twitter_id_str: checkUser.twitter_id_str,
      twitter_screen_name: checkUser.twitter_screen_name,
      twitter_age: checkUser.twitter_age,
      referral_link: checkUser.referral_link,
      referral_code: checkUser.referral_code,
      jwt: checkUser.jwt,
      email: checkUser.email,
      walletAddress: checkUser.walletAddress,
      mahaReferrals: checkUser.mahaReferrals,
      mahaRewards: checkUser.mahaRewards,
      referredBy: checkUser.referredBy || ''

    }
    res.send({
      userProfile,
      success: true
    })
  }
  else {
    res.send({ error: 'cannot find user' })
  }
}

export const addEmailContractAddress = async (req, res) => {
  try {
    const verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body.recaptcha_token + "&remoteip=" + req.connection.remoteAddress;
    await request(verificationUrl, async (error, response, body) => {
      body = JSON.parse(body);
      if (body.success !== undefined && !body.success) {
        return res.json({ "responseCode": 1, "responseDesc": "Failed captcha verification" });
      }
      else {
        const checkEmailWalletAddress = await User
          .findOne({ $or: [{ email: req.body.email }, { walletAddress: req.body.walletAddress }] })
        if (checkEmailWalletAddress) {
          res.send({ success: false })
        }
        else {
          const checkUser = await User.findOne({ twitter_id: req.body.twitter_id })
          if (checkUser) {
            checkUser.set('email', req.body.email)
            checkUser.set('walletAddress', req.body.walletAddress)
            await checkUser.save()
            const referredUser = await User.findOne({ referral_code: checkUser.referredBy })
            // referredUser.set('mahaReferrals', referredUser.mahaReferrals + 1)
            // await referredUser.save()
            const checkEmailCounter = await emailCounter()
            if (checkEmailCounter) {
              if (referredUser) {
                referredUser.set('mahaReferrals', referredUser.mahaReferrals + 1)
                await referredUser.save()
                const emailData = {
                  referrer_name: referredUser.name,
                  to_email: checkUser.email,
                  referral_link: checkUser.referral_link
                }
                //MAHA Referral welcome
                // await sendEmail(emailData, 'd-4cc16d34aad04de6ab22a6138b8e10fe')
                // await sendEmail(emailData, 'd-0a264b4c808b4ec2afd1d00fb68b55e5')
              }
              else {
                const emailData = {
                  first_name: checkUser.name,
                  to_email: checkUser.email,
                }
                // Non-referral SignUp
                // await sendEmail(emailData, 'd-7740705c270f4814bfb717dd9ae8750e')
                // await sendEmail(emailData, 'd-a8fe643c0bbd42dcabc645fc5283ffb8')
              }
            }
            // const emailMessage = 'Welcome to MahaDAO Referral Program'
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

            const userProfile = {
              _id: checkUser.id,
              follow_twitter: checkUser.follow_twitter,
              follow_channel: checkUser.follow_channel,
              twitter_followers: checkUser.twitter_followers,
              name: checkUser.name,
              twitter_id: checkUser.twitter_id,
              twitter_id_str: checkUser.twitter_id_str,
              twitter_screen_name: checkUser.twitter_screen_name,
              twitter_age: checkUser.twitter_age,
              referral_link: checkUser.referral_link,
              referral_code: checkUser.referral_code,
              jwt: checkUser.jwt,
              email: checkUser.email,
              walletAddress: checkUser.walletAddress,
              mahaReferrals: checkUser.mahaReferrals,
              mahaRewards: checkUser.mahaRewards,
              referredBy: checkUser.referredBy || ''
            }

            res.send(userProfile)
          }
          else {
            res.send({ error: 'cannot find user' })
          }
        }
      }
    })
  } catch (e) {
    res.send(e)
  }
}

export const referralList = async (req, res) => {
  try {
    const user = req.user
    const checkUser = await User.findOne({ twitter_id: user.twitter_id })

    if (checkUser) {
      const referralUsers = await Referral
        .find({ referredBy: checkUser.id })
        .populate({ path: 'referredUser', select: 'email name' })
      res.send(referralUsers)
    }
    else {
      res.send({ error: 'user not found' })
    }
  } catch (e) {
    console.log(e);

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
    const userProfile = {
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
      mahaRewards: userDetails.mahaRewards,
      referredBy: userDetails.referredBy || ''

    }
    res.send(userProfile)
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
      .then(() => {
        // console.log('The CSV file was written successfully')
      });

    res.send({ success: true })
  }
  res.send({ error: 'no referrals found' })
}

export const getReferralTree = async (req, res) => {
  const userDetails = await User.find({})

  let dataArray = []
  await bluebird.mapSeries(userDetails, async (data) => {
    const referralId = await User.findOne({ referral_code: data.referredBy })
    let parentId = null
    if (referralId) {
      parentId = String(referralId._id)
    }
    dataArray.push({
      label: data.name,
      id: String(data._id),
      parentId: parentId
    })
  })

  res.send({ data: dataArray })
}

export const deleteUser = async (req, res) => {
  const userId = req.body.id
  const checkUser = await User.findOne({ _id: userId })
  if (checkUser) {
    await User.deleteOne({ _id: userId })
    const referrralData = await Referral.findOne({ referredUser: userId })
    await Referral.deleteOne({ referredUser: userId })
    res.send({ success: true })
  }
  else {
    res.send({ success: false })
  }

}
