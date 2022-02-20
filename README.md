
## Example of basic account system on React and MongoDB
This is an example web application written in React to demonstrate basic account feature with MongoDB.
You can create an account and sign in with email or tokens.  
I borrowed ( ported ) most of code from Meteor's account package which I love.
I ported Meteor's account package because I could not find good examples to develop simple signup/signin system without using Meteor when I start using React

## Install  
```
git https://github.com/kouohhashi/react_mongo_accounts.git
cd react_mongo_accounts
yarn install
yarn postinstall
```

## modify database name on routes/api.js  

## Usage  

### Start API server  
API server is going to start on port 4002
You can change parameters around mongodb at ./server/routes/settings.js
```
yarn start_server
```

### Start React  
React is going to start on port 3000
```
yarn run start_react
```

You can check at http://localhost:3000  

## Requirement  

### You need MongoDB. Here's an example of installing MongoDB on mac os X  
install mongodb based on below.
https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/

### Notes
```yarn postinstall``` fix a bug of semantic-ui
https://github.com/Semantic-Org/Semantic-UI-React/issues/4287

## License  
MIT. You can do whatever you want.  
