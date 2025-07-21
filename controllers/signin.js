const handleSignin = (db, bcrypt, saltRounds) => (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json('incorrect form submission');
  }

  db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data => {
      if (data.length === 0) {
        return res.status(400).json('wrong credentials'); // 👈 aici
      }

      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db.select('*').from('users')
          .where('email', '=', email)
          .then(user => {
            res.json(user[0]);
          })
          .catch(err => res.status(400).json('unable to get user'));
      } else {
        res.status(400).json('wrong credentials');
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json('server error');
    });
}

module.exports = {
    handleSignin: handleSignin
}