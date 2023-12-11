import { WINDOW_KEY, COUNT_KEY } from "./constants.js";

class WindowManager {
	#windows;
	#count;
	#id;
	#winData;
	#winShapeChangeCallback;
	#winChangeCallback;
	
	constructor () {
		const that = this;

		// When localStorage is changed from another window
		addEventListener("storage", (event) => {
			if (event.key == WINDOW_KEY) {
				const newWindows = JSON.parse(event.newValue);
				const winChange = that.#didWindowsChange(that.#windows, newWindows);
				that.#windows = newWindows;
				if (winChange) {
					if (that.#winChangeCallback) that.#winChangeCallback();
				}
			}
		});

		// When current window is about to be closed
		window.addEventListener('beforeunload', () => {
			const index = that.getWindowIndexFromId(that.#id);
			// Remove this window from the list and update local storage
			that.#windows.splice(index, 1);
			that.updateWindowsLocalStorage();
		});
	}

	// Check if theres any changes to the window list
	#didWindowsChange(pWins, nWins) {
		if (pWins.length != nWins.length) {
			return true;
		}
		let c = false;
		for (let i = 0; i < pWins.length; i += 1) {
			if (pWins[i].id != nWins[i].id) {
				c = true;
			}
		}
		return c;
	}

	// Initiate current window (add metadata for custom data to store with each window instance)
	init(metaData) {
		this.#windows = JSON.parse(localStorage.getItem(WINDOW_KEY)) || [];
		this.#count = localStorage.getItem(COUNT_KEY) || 0;
		this.#count += 1;
		this.#id = this.#count;
		const shape = this.getWinShape();
		this.#winData = { id: this.#id, shape, metaData };
		this.#windows.push(this.#winData);
		localStorage.setItem(COUNT_KEY, this.#count);
		this.updateWindowsLocalStorage();
	}

	getWinShape() {
		let shape = {
			x: window.screenLeft,
			y: window.screenTop,
			w: window.innerWidth,
			h: window.innerHeight
		};
		return shape;
	}

	getWindowIndexFromId(id) {
		let index = -1;
		for (let i = 0; i < this.#windows.length; i+= 1) {
			if (this.#windows[i].id == id) {
				index = i;
			}
		}
		return index;
	}

	updateWindowsLocalStorage() {
		localStorage.setItem(WINDOW_KEY, JSON.stringify(this.#windows));
	}

	update() {
		const winShape = this.getWinShape();
		const shouldUpdate = winShape.x != this.#winData.shape.x || winShape.y != this.#winData.shape.y || winShape.w != this.#winData.shape.w || winShape.h != this.#winData.shape.h;
		if (shouldUpdate) {
			this.#winData.shape = winShape;
			const index = this.getWindowIndexFromId(this.#id);
			this.#windows[index].shape = winShape;
			if (this.#winShapeChangeCallback) {
				this.#winShapeChangeCallback();
			}
			this.updateWindowsLocalStorage();
		}
	}

	setWinShapeChangeCallback(callback) {
		this.#winShapeChangeCallback = callback;
	}

	setWinChangeCallback(callback) {
		this.#winChangeCallback = callback;
	}

	getWindows() {
		return this.#windows;
	}

	getThisWindowData() {
		return this.#winData;
	}

	getThisWindowID() {
		return this.#id;
	}
}

export default WindowManager;
