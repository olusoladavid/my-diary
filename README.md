[![Build Status](https://travis-ci.org/olusoladavid/my-diary.svg?branch=ft-rest-api-endpoints-159069640)](https://travis-ci.org/olusoladavid/my-diary)
[![Coverage Status](https://coveralls.io/repos/github/olusoladavid/my-diary/badge.svg?branch=develop)](https://coveralls.io/github/olusoladavid/my-diary?branch=develop)
[![Maintainability](https://api.codeclimate.com/v1/badges/28ee352fbbd498a8cafd/maintainability)](https://codeclimate.com/github/olusoladavid/my-diary/maintainability)

# my-diary

MyDiary is an online journal where users can pen down their thoughts and feelings

## Required Features

- Users can create an account and log in.
- User can view all entries to their diary.
- Users can view the contents of a diary entry.
- Users can add or modify an entry.
- Users can delete an entry

## Additional Features

- Users can set and get daily notifications that prompt them to add an entry to their diary

## Tech Stack

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [PostgreSQL](https://postgresql.org) 
- Javascript (ES6+)
- CSS3
- HTML5

## API Endpoints

| Endpoint                    | Functionality        |
| --------------------------- | -------------------- |
| POST `/auth/signup`         | Register a user      |
| POST `/auth/login`          | Login a user         |
| GET `/profile`              | Fetch user profile   |
| GET `/entries`              | Fetch all entries    |
| GET `/entries/<entryId>`    | Fetch a single entry |
| POST `/entries`             | Create an entry      |
| PUT `/entries/<entryId>`    | Modify an entry      |
| DELETE `/entries/<entryId>` | Delete an entry      |

## Build Setup

```
#clone repo and cd into directory
git clone https://github.com/olusoladavid/my-diary.git
```

```
# install dependencies
npm install

#serve in development environment
npm run dev

# build for production
npm run build
```

## Testing

```
# Run test cases
npm test
```

API Endpoint: https://my-diary-api.herokuapp.com/api/v1

UI Template: https://olusoladavid.github.io/my-diary/UI/

## License

- MIT
