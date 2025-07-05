const bcrypt = require('bcrypt');

const inputPassword = '123456';

bcrypt.hash(inputPassword, 10, function(err, hash) {
  if (err) {
    console.error("❌ Error hashing password:", err);
  } else {
    console.log("✅ Hashed password for '123456':", hash);
  }
});



