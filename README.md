# Hüseyin Cahit Kebapcıoğlu

## You can see the website [HERE](https://movie-app-hck.herokuapp.com/)

- Website uses a free heroku account so it may take a while load.
- On the off of getting an Error please contact the administrator: husamcahit@gmail.com & +905325511756

### Introduction

This project is the final project for the Patika - Gusto & Remote Team Bootcamp.
Project has 5 Entities:

- Actor
- Comment
- Film
- Liked
- Post
- User

Relationship table

![movieApp](https://i.imgur.com/tEOwwIi.png)

4 Routes with their respective controllers:

- homeRoute: has routes to indexPage("/") and dashboard("/dashboard")
- postRoute: Handles creating posts, liking posts and commenting on posts.
- searchRoute: Handles the film and actor searching, uses imdb apis
- sessionRoute: Handles user creation and login

### Prerequisites

- Node v16.13.0+ [Official website](https://nodejs.org/en/download/)
- npm 8.1.0
- A running mysql server [Official website](https://www.mysql.com/)

### Installation

Clone the repo:

```
git clone https://github.com/BeyazGolge/movieApp.git
cd movieApp/
```

Install the dependencies

```
npm install
```

Run the website on your local machine(You need to change createConnection options to you local mysql server, Google login and Facebook login would not work because their redirect domains are arranged in respective developer accounts):

```
nodemon
```
