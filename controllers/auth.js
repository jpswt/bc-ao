const connection = require('../sql/connection');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');

const register = async (req, res) => {
	let sql = `Insert into users (username, email, pw_hash) values (?,?,?)`;
	let { username, email, password } = req.body;

	let hashedPassword;

	try {
		hashedPassword = await bcrypt.hash(password, 10);
	} catch (err) {
		console.log(err, 'hash');
		res.status(500).json({ message: `Error creating the user`, err });
	}

	const body = [username, email, hashedPassword];
	connection.query(sql, body, (err, results) => {
		if (err) {
			return res.status(500).json({ message: `Error creating the user`, err });
		}
		console.log(results);

		let token = JWT.sign(
			{
				username: username,
				user_id: results.insertId,
			},
			process.env.JWT_SECRET
		);
		console.log(token);

		return res
			.status(200)
			.json({ message: `User created successfully`, results, token });
	});
};

const login = async (req, res) => {
	let sql = `SELECT * from users where EMAIL = ?`;
	let { email, password } = req.body;

	connection.query(sql, [email], async (err, rows) => {
		if (err) {
			return res.status(500).json({ message: `Could not get user`, err });
		}
		if (rows.length > 1) {
			console.log(`Return too many email addresses`);
			return res
				.status(500)
				.json({ message: `Return too many rows for the email address` });
		}
		if (rows.length === 0) {
			console.log('Email does not exist');
			return res.status(500).json({
				message: `The email does not exist.  Please sign up for an account or try again`,
			});
		}
		console.log(rows);

		const user = rows[0];
		let hashedPassword = user.pw_hash;
		let match;
		try {
			match = await bcrypt.compare(password, hashedPassword);
		} catch (err) {
			console.log(err);
			return res
				.status(500)
				.json({ message: 'Something went wrong logging in', err });
		}

		if (!match) {
			return res.status(500).json({ message: 'Password do not match' });
		}

		let token = JWT.sign(
			{
				username: user.username,
				email: user.email,
				user_id: user.id,
			},
			process.env.JWT_SECRET
		);
		console.log(token);

		return res.status(200).json({
			message: 'Successful Login!',
		});
	});
};

module.exports = { register, login };
