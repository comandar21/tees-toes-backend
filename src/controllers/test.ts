import Request from "request-promise";
import axios from 'axios'
import { sendRequest } from "../library/utils";
const Twitter = require('twitter');
export const test = async () => {

    const response = await axios(
        {
            url: 'https://api.twitter.com/1.1/followers/ids.json',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAALpLNgEAAAAAfY3Az3dZ3h%2F6Ku4mLH8zoYmaxHc%3DbiKtOfBKcRIeuCkM4K1rutekhoHoW4uowNv6Ee3QNZGs1kTTgO',
                'Content-Type': 'Application/json'
            }
        })
    console.log(response.data);
}

const twitter = async () => {
    const client = new Twitter({
        consumer_key: 'JTA2224x1MdcGjfcIVloSq0ys',
        consumer_secret: 'U3NnxiwyerYoQMpeR1F9FRtdD2xiJ4ujiJAXWb1U84jHycD2wm',
        bearer_token: 'AAAAAAAAAAAAAAAAAAAAAGHU%2BgAAAAAAzPWgY7yvgzOKs08mckk88KDKsR0%3DWmzMcsPGdZf6zUVZV37jUz8kyWctgwVIj04mWoVWn2Us0prmcM'
    });

    client.get('favorites/list', function (error, tweets, response) {
        if (error) throw error;
        console.log(tweets);  // The favorites.
        console.log(response);  // Raw response object.
    });
}

twitter()