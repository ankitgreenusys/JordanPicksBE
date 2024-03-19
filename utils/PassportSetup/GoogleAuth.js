const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      // clientID: process.env.GOOGLE_CLIENT_ID,
      // clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      clientID:
        "19246310025-40us8ovb0idsqrifh19hvbacvm2mms10.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "/user/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      done(null, profile);
    }
  )
);

module.exports = passport;
