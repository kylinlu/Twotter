const express = require('express');
const cors = require('cors');
const monk = require('monk');
const Filter = require('bad-words');
const rateLimit = require('express-rate-limit');

const app = express();

const db = monk(process.env.MONGO_URI || 'localhost/meower');
const mews = db.get('mews');
const filter = new Filter();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
	message: 'Meower'
});

app.get('/mews', (req, res) => {
	mews
		.find()
		.then(mews => {
			res.json(mews);
		}).catch(next);
});

app.get('/v2/mews', (req, res) => {
	let { skip = 0, limit = 10, sort = 'desc' } = req.query;
	skip = parseInt(skip) || 0;
	limit = parseInt(limit) || 10;
	skip = skip < 0 ? 0 : skip
	limt = Math.min(50, Math.max(1, limit));
	Promise.all([
		mews.
			count(),
		mews
			.find({}, {
				skip,
				limit,
				sort: {
					created:  sort === 'desc' ? -1 : 1
				}
			})
	])
		.then(([ total, mews ]) => {
			res.json({
				total,
				mews,
				meta: {
					skip,
					limit,
					has_more: total - (skip + limit) > 0,
				}
			});
		}).catch(next);
});

function isValidMew(mew) {
	return mew.name && mew.name.toString().trim() !== '' &&
	mew.content && mew.content.toString().trim() !== '';
}

app.use(rateLimit({
	windowMs: 5 * 1000, //1 request every 5 seconds limit
	max: 1
}));

app.post('/mews', (req, res) => {
	if (isValidMew(req.body)) {
		const mew = {
			name: filter.clean(req.body.name.toString()),
			content: filter.clean(req.body.content.toString()),
			created: new Date()
		};
		mews
			.insert(mew)
			.then(createdMew => {
				res.json(createdMew);
			});
	} else {
		res.status(422);
		res.json({
			message: 'Hey! Name and Content are required!'
		});
	}
});

app.listen(5000, () => {
	console.log('Listening on http://localhost:5000');
});