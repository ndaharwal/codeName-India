// Array of image URLs
const images = [
    './images/bg_posters/1.jpg',
	'./images/bg_posters/2.jpg',
	'./images/bg_posters/3.jpg',
	'./images/bg_posters/4.jpg',
	'./images/bg_posters/5.jpg',
	'./images/bg_posters/6.jpg',
	'./images/bg_posters/7.jpg',
	'./images/bg_posters/8.jpg',
	'./images/bg_posters/9.jpg',
	'./images/bg_posters/10.jpg',
	'./images/bg_posters/11.jpg',
	'./images/bg_posters/12.jpg',
	'./images/bg_posters/13.jpg',
	'./images/bg_posters/14.jpg',
	'./images/bg_posters/15.jpg',
	'./images/bg_posters/16.jpg',
	'./images/bg_posters/17.jpg',
	'./images/bg_posters/18.jpg',
	'./images/bg_posters/19.jpg',
	'./images/bg_posters/20.jpg',
	'./images/bg_posters/21.jpg',
	'./images/bg_posters/22.jpg',
	'./images/bg_posters/23.jpg',
	'./images/bg_posters/24.jpg',
	'./images/bg_posters/25.jpg'
    // Add more image URLs as needed
];

// Get the img element by its ID
const imageElement = document.getElementById('popupimage');

// Get a random index to select an image from the images array
const randomIndex = Math.floor(Math.random() * images.length);

// Set the src attribute of the img element to the randomly selected image URL
imageElement.src = images[randomIndex];