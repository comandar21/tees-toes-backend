require('dotenv').config()
import * as user from './user'
const oauthCallback = process.env.FRONTEND_URL;
const oauth = require('../library/oauth-promise')(oauthCallback);
const COOKIE_NAME = 'oauth_token';
const accessTokenSecret = process.env.JWT_SECRET

let global_oauth_token = ''
let referralCode = ''
let tokens = {};

export const oAuthRequestToken = async (req, res) => {
  try {
    referralCode = req.body.referralCode
    const { oauth_token, oauth_token_secret } = await oauth.getOAuthRequestToken();
    await res.cookie(COOKIE_NAME, oauth_token, {
      maxAge: 15 * 60 * 1000, // 15 minutes
      httpOnly: true,
    });
    tokens[oauth_token] = { oauth_token_secret };
    console.log(oauth_token);

    res.json({ oauth_token });
  } catch (e) {
    console.log('error 24', e);
  }

}

export const oAuthAccessToken = async (req, res) => {
  console.log('body', req.body);
  console.log('headers', req.headers.access_token)

  try {
    const { oauth_token: req_oauth_token, oauth_verifier } = req.body;
    const oauth_token = req.headers.access_token
    console.log('oauth_token', oauth_token)
    // const oauth_token = global_oauth_token
    const oauth_token_secret = tokens[oauth_token].oauth_token_secret;

    if (oauth_token !== req_oauth_token) {
      res.status(403).json({ message: "Request tokens do not match" });
      return;
    }
    const { oauth_access_token, oauth_access_token_secret } = await oauth
      .getOAuthAccessToken(oauth_token, oauth_token_secret, oauth_verifier);

    tokens[oauth_token] = { ...tokens[oauth_token], oauth_access_token, oauth_access_token_secret };
    console.log(tokens);

    res.json({ success: true });

    // } catch (error) {
    //     res.status(403).json({ message: "Missing access token" });
    // }
  } catch (e) {
    console.log('error 52', e);
  }
}

export const userProfileBanner = async (req, res) => {
  try {
    const oauth_token = req.headers.access_token
    // const oauth_token = global_oauth_token;

    const { oauth_access_token, oauth_access_token_secret } = tokens[oauth_token];
    const response = await oauth.getProtectedResource("https://api.twitter.com/1.1/account/verify_credentials.json", "GET", oauth_access_token, oauth_access_token_secret);
    // console.log('response', response.data);

    const parseData = JSON.parse(response.data)
    const newUser = await user.twitterSignUp(parseData, oauth_access_token, oauth_access_token_secret, referralCode)

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
