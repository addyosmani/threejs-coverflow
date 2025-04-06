# Three.js Coverflow Example

This project demonstrates a Cover Flow effect implemented using Three.js. It displays album covers fetched from a local `albums.json` file in a 3D carousel interface.

![](https://res.cloudinary.com/ddxwdqwkr/image/upload/v1743970602/addy/Screenshot_2025-04-06_at_1.16.33_PM.webp)

## Features

- Displays album covers in a 3D Cover Flow style.
- Loads album data dynamically from `albums.json`.
- Uses Three.js for 3D rendering and GSAP for animations.
- Allows navigation through the albums using a range slider or mouse wheel.
- Includes reflections for the album covers.

## How to Run

1.  Ensure you have a local web server set up. (e.g., using Python's `http.server`, Node.js's `serve`, or a VS Code extension like Live Server).
2.  Serve the project directory.
3.  Open `index.html` in your web browser via the local server address.

## Files

- `index.html`: The main HTML file that sets up the page structure and includes necessary scripts.
- `style.css`: Contains the CSS styles for the page layout and slider.
- `main.js`: The core JavaScript file using Three.js and GSAP to create the Cover Flow effect, load data, and handle interactions.
- `albums.json`: A JSON file containing the data (title, artist, image URL) for the albums to be displayed.
- `imgs/`: Directory intended for storing images (like the background `bg.png`). Album images are loaded directly from URLs specified in `albums.json`.

## Dependencies

- [Three.js](https://threejs.org/): A 3D graphics library for JavaScript.
- [GSAP (GreenSock Animation Platform)](https://greensock.com/gsap/): A JavaScript animation library used for smooth transitions.
