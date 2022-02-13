import express from 'express';
import { createConnection } from 'typeorm';
import bodyparser from 'body-parser';
import cookieParser from 'cookie-parser';
import homeRoute from './routes/homeRoute';
import User from './entities/User';
import Actor from './entities/Actor';
import Film from './entities/Film';
import searchRoute from './routes/searchRoute';
import Post from './entities/Post';
import Liked from './entities/Liked';
import Comment from './entities/Comment';
import postRoute from './routes/postRoute';
import sessionRoutes from './routes/sessionRoutes';
import path from 'path';
import flash from 'connect-flash';
import * as dotenv from 'dotenv';
import session from 'express-session';
dotenv.config();

const app = express();

// Database connection
const main = async () => {
  try {
    await createConnection({
      type: 'mysql',
      host: process.env.MYSQL_HOST as string,
      port: 3306,
      username: process.env.MYSQL_USERNAME as string,
      password: process.env.MYSQL_PASSWORD as string,
      database: process.env.MYSQL_DATABASE as string,
      entities: [User, Actor, Liked, Film, Post, Comment],
      synchronize: false,
    });
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    // Middlewares
    app.use(bodyparser.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(cookieParser());
    app.use(express.static('public'));
    app.use(
      session({
        secret: 'keyboard cat',
        resave: true,
        saveUninitialized: true,
      })
    );
    app.use(flash());
    app.use((req, res, next) => {
      res.locals.flashMessages = req.flash();
      next();
    });
    // Routes
    app.use('/', homeRoute);
    app.use('/', sessionRoutes);
    app.use('/search', searchRoute);
    app.use('/posts', postRoute);

    app.listen(process.env.PORT || 3000, () => {
      // tslint:disable-next-line:no-console
      console.log('App is live');
    });
  } catch (error) {
    throw error;
  }
};

main();
