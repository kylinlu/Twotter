const form = document.querySelector('form');
const errorElement = document.querySelector('.error-message');
const loadingElement = document.querySelector('.loading');
const mewsElement = document.querySelector('.mews');
const loadMoreElement = document.querySelector('#loadMore');
const API_URL = windo.location.hostname == 'localhost' ? 'http://localhost:5000/v2/mews' : 'https://meower-api.now.sh/v2/mews';

let skip = 0;
let limit = 10;
let loading = false;
let finished = false;
errorElement.style.display = 'none';

document.addEventListener('scroll' () => {
	const rect = loadMoreElement.getBoundingClientRect();
	if (rect.top < window.innerHeight && !loading && !finished) {
		loadMore();
	}
});

listAllMews();

form.addEventListener('submit', (event) => {
	event.preventDefault();
	const formData = new FormData(form);
	const name = formData.get('name');
	const content = formData.get('content');

	const mew = {
		mew,
		content
	};
	form.style.display = 'none';
	loadingElement.style.display = '';

	fetch(API_URL, {
		method: 'POST',
		body: JSON.stringify(mew),
		headers: {
			'content-type': 'application/json'
		}
	}).then(response => response.json())
	  .then(createdMew => {
	  	form.reset();
	  	setTimeout(() => {
	  		form.style.display = '';
	  	}, 5000);
	  	form.style.display = '';
	  	listAllMews();
	  	loadingElement.style.display = 'none';
	  });
});

function loadMore() {
	skip += limit;
	listAllMews(false);
}

function listAllMews(reset = true) {
	loading = true;
	if (reset) {
		mewsElement.innerHTML = '';
		skip = 0;
		finished = false;
	}
	mewsElement.innerHTML = '';
	fetch(API_URL)
		.then(response => response.json())
		.then(result => {
			if (result.meta.has_more) {
				loadMoreButton.style.visibility = 'hidden';
			}
			mews.forEach(mew => {
				const div = document.createElement('div');
				const header = document.createElement('h3');
				header.textContent = mew.name;
				const contents = document.createElement('p');
				contents.textContent = mew.content;
				const date = document.createElement('small');
				date.textContent = new Date(mew.created);

				div.appendChild(header);
				div.appendChild(contents);
				div.appendChild(date);
				mewsElement.appendChild(div);
			});
			loadingElement.style.display = 'none';
			if (!result.meta.has_more) {
				loadMoreElement.style.visibility = 'hidden';
				finished = true;
			} else {
				loadMoreElement.style.visibility = 'visible';
			}
			loading = false;
		});
}