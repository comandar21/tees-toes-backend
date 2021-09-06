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

let global_oauth_token = ''

let tokens = {};

const getRandomString = () => {
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}

export const twitterSignUp = async (data) => {

    const checkUser = await User.findOne({ twitter_id: String(data.id) })

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
        })

        await newUser.save()
        return newUser
    }
    else {
        const token = jwt.sign({ twitter_id: checkUser.id }, accessTokenSecret)
        checkUser.set('jwt', token)
        await checkUser.save()
        return checkUser
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

export const oAuthRequestToken = async (req, res) => {
    try {
        const { oauth_token, oauth_token_secret } = await oauth.getOAuthRequestToken();
        await res.cookie(COOKIE_NAME, oauth_token, {
            maxAge: 15 * 60 * 1000, // 15 minutes
            httpOnly: true,
        });
        tokens[oauth_token] = { oauth_token_secret };
        global_oauth_token = oauth_token
        console.log(tokens);

        res.json({ oauth_token });
    } catch (e) {
        console.log(e);
    }

}

export const oAuthAccessToken = async (req, res) => {

    const { oauth_token: req_oauth_token, oauth_verifier } = req.body;
    // const oauth_token = req.cookies[COOKIE_NAME];
    const oauth_token = global_oauth_token

    const oauth_token_secret = tokens[oauth_token].oauth_token_secret;

    // if (oauth_token !== req_oauth_token) {
    //     res.status(403).json({ message: "Request tokens do not match" });
    //     return;
    // }

    if (global_oauth_token !== req_oauth_token) {
        res.status(403).json({ message: "Request tokens do not match" });
        return;
    }

    const { oauth_access_token, oauth_access_token_secret } = await oauth
        .getOAuthAccessToken(global_oauth_token, oauth_token_secret, oauth_verifier);

    tokens[global_oauth_token] = { ...tokens[global_oauth_token], oauth_access_token, oauth_access_token_secret };

    res.json({ success: true });

    // } catch (error) {
    //     res.status(403).json({ message: "Missing access token" });
    // }
}

export const userProfileBanner = async (req, res) => {
    console.log('userProfileBanner');
    try {
        // const oauth_token = req.cookies[COOKIE_NAME];
        const oauth_token = global_oauth_token;

        const { oauth_access_token, oauth_access_token_secret } = tokens[oauth_token];
        const response = await oauth.getProtectedResource("https://api.twitter.com/1.1/account/verify_credentials.json", "GET", oauth_access_token, oauth_access_token_secret);
        // console.log('response', response.data);

        const parseData = JSON.parse(response.data)
        const newUser = await twitterSignUp(parseData)
        console.log(newUser);

        res.send(newUser);

    } catch (error) {
        res.status(403).json({ message: "Missing, invalid, or expired tokens" });
    }

}

export const twitterLogout = async (req, res) => {

    try {
        const oauth_token = req.cookies[COOKIE_NAME];
        delete tokens[oauth_token];
        res.cookie(COOKIE_NAME, {}, { maxAge: -1 });
        res.json({ success: true });
    } catch (error) {
        res.status(403).json({ message: "Missing, invalid, or expired tokens" });
    }

}