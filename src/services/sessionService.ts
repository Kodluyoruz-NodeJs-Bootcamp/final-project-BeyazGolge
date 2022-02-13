import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../entities/User';
import querystring from 'querystring';

import axios from 'axios';
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
dotenv.config();

export default class SessionService {
  redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URL as string;
  oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URL
  );

  async findByTokenWithRelations(token: string) {
    const userID = jwt.verify(token, process.env.SECRET as string);
    const user = User.findOne({
      where: { id: userID },
      relations: ['likes', 'comments', 'posts'],
    });
    return user;
  }

  async hasValidToken(token: string): Promise<boolean> {
    if (!token) return false;
    const userID = jwt.verify(token, process.env.SECRET as string);
    return !!User.findOne(userID.toString());
  }

  async loginUser(
    incomingPassword: string,
    userPassword: string,
    userID: string
  ): Promise<string> {
    if (!(await bcrypt.compare(incomingPassword, userPassword))) {
      throw Error('passwords does not match');
    }
    return jwt.sign(userID, process.env.SECRET as string);
  }

  async createUser(
    name: string,
    email: string,
    password: string
  ): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    await User.create({
      name,
      email,
      password,
    }).save();
  }

  async getFacebookOAuthURL() {
    return `https://www.facebook.com/v6.0/dialog/oauth?client_id=${
      process.env.FACEBOOK_APP_ID
    }&redirect_uri=${encodeURIComponent(
      process.env.FACEBOOK_OAUTH_REDIRECT_URL!
    )}`;
  }

  async getTokensforFacebook(code: string) {
    const accessTokens = new Set();
    try {
      const authCode = code;
      const accessTokenUrl =
        'https://graph.facebook.com/v6.0/oauth/access_token?' +
        `client_id=${process.env.FACEBOOK_APP_ID}&` +
        `client_secret=${process.env.FACEBOOK_APP_SECRET}&` +
        `redirect_uri=${encodeURIComponent(
          process.env.FACEBOOK_OAUTH_REDIRECT_URL!
        )}&` +
        `code=${encodeURIComponent(authCode)}`;

      const accessToken = await axios
        .get(accessTokenUrl)
        // tslint:disable-next-line: no-string-literal
        .then((res) => res.data['access_token']);
      accessTokens.add(accessToken);

      return accessToken;
    } catch (err) {
      throw Error('Problem occured with facebook login');
      return;
    }
  }

  async getFacebookUser(code: string) {
    try {
      const accessToken = await this.getTokensforFacebook(code);
      const data = await axios
        .get(
          `https://graph.facebook.com/me?access_token=${encodeURIComponent(
            accessToken
          )}&fields=id,first_name,last_name,email`
        )
        .then((res) => res.data);
      return data;
    } catch (err) {
      throw Error('Problem occured with facebook login');
      return;
    }
  }

  async getGoogleOAuthURL() {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes,
    });
  }

  async getTokensforGoogle({
    code,
    clientId,
    clientSecret,
    redirectUri,
  }: {
    code: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  }): Promise<{
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    id_token: string;
  }> {
    const url = 'https://oauth2.googleapis.com/token';
    const values = {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    };

    return axios
      .post(url, querystring.stringify(values), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .then((res) => res.data)
      .catch((error) => {
        throw new Error(error.message);
      });
  }
  async getGoogleUser(code: string) {
    const { id_token, access_token } = await this.getTokensforGoogle({
      code,
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URL as string,
    });

    const googleUser = await axios
      .get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
        {
          headers: {
            Authorization: `Bearer ${id_token}`,
          },
        }
      )
      .then((res) => res.data)
      .catch((error) => {
        throw new Error(error.message);
      });
    return googleUser;
  }
}
