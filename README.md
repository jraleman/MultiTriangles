# MultiTriangles

## Project Description

This project demonstrates how to set up a synchronized 3D scene across multiple browser windows using Three.js and localStorage. It showcases the ability to create interactive 3D environments that can be manipulated in real-time across different windows, as long as they share the same origin. This is particularly useful for creating complex, multi-view setups for 3D modeling, gaming, or interactive art installations.

## Setup

To set up the project, follow these steps:

1. **Clone the Repository**: Clone this repository to your local machine.
2. **Install Dependencies**: Navigate to the cloned directory and run `npm install` to install all required dependencies.

## Usage

1. **Starting the Server**: Use `lite-server` to start a local development server. If `lite-server` is not installed, install it globally using `npm install -g lite-server`.
2. **Launching the Application**: Run `lite-server` in the project directory. This will open the project in your default web browser.
3. **Opening Multiple Windows**: Open multiple windows or tabs with the same URL to see the synchronized 3D scene.
4. **Interacting with the Scene**: Changes made in one window, will be reflected in real-time across all open windows.

### LocalStorage Synchronization

- The project uses `localStorage` for maintaining synchronization across windows. 
- Any interaction in one window is stored in `localStorage` and is then retrieved in other windows to update the scene accordingly.

## Credits

This project is heavily inspired by and based on the original work of [bgstaal's multipleWindow3dScene](https://github.com/bgstaal/multipleWindow3dScene)

For further information or to contribute to the project, please visit the GitHub repository.
