var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var request      = require('request');

var passport = require('passport')
  , GoogleStrategy = require('passport-google').Strategy
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

app.use(cookieParser()); // required before session.
app.use(session({
    secret: 'keyboard cat'
  , proxy: true // if you do SSL outside of node.
}));
app.use(passport.initialize());
app.use(passport.session());

/*passport.use(new GoogleStrategy({
    returnURL: 'http://localhost/',
    realm: 'http://localhost/'
  },
  function(identifier, profile, done) {
    User.findOrCreate({ openId: identifier }, function(err, user) {
      done(err, user);
    });
  }
));*/

passport.use('google', new OAuth2Strategy({
	authorizationURL: 'https://accounts.google.com/o/oauth2/auth',
    tokenURL: 'https://accounts.google.com/o/oauth2/token',
    clientID: '412496805150-h3kvatusbfr2hsusspopvcmaafdnk7fd.apps.googleusercontent.com',
    clientSecret: '4jBRKvlB7OQDHqkROVAT_96C',
    callbackURL: 'http://slag.com:3000/oauth2callback'
  },
  function(accessToken, refreshToken, profile, done) {
  	console.log(profile);
   done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

// Google will redirect the user to this URL after authentication.  Finish
// the process by verifying the assertion.  If valid, the user will be
// logged in.  Otherwise, authentication has failed.
app.get('/oauth2callback', 
  passport.authenticate('google', { successRedirect: '/loggedIn',
                                    failureRedirect: '/loginError' }));

app.get('/loggedIn', function(req, res){
  res.send('Logged in');
});

app.get('/loginError', function(req, res){
  res.send('Error');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});