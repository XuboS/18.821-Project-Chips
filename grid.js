/**
 * Create a grid object. A grid contains an array of cell objects.
 * 
 * @param {s} grid returned will be of size X size. 
 *            s needs to be at least 6 so that the grid is large enough to contain one of the preset grids.
 * @constructor
 */
grid = function(s) {
	
	var that = Object.create(grid.prototype);
	var size = s;

	/**
	 * Create a cell object. A cell is either alive or dead. 
	 * A cell has a neighbors attribute that contains an array of neighbor cells.
	 * 
	 * @constructor
	 */
	var cell = function() {
		
		var that = Object.create(cell.prototype);
		var curChips = 0;
		var oldChips = 0;
		var neighbors = [];
		
		that.getChips = function(){
			return curChips;
		};

		that.setChips = function(x){
			oldChips = curChips;
			curChips = x;
		};

		that.stepBack = function(){
			curChips = oldChips;
		}

		that.addNeighbors = function(array) {
			neighbors = neighbors.concat(array);
		};

		that.nextChips = function() {
			// For each neighbor that has at least 4 chips, increase numAdded by 1.
			var numAdded = neighbors.reduce(function(previousValue, currentValue) {
				return currentValue.getChips() >= 4? previousValue + 1: previousValue;
			}, 0);
			// If the cell currently has at least 4 chips, remove 4 chips.
			var numSubtracted = curChips >= 4? 4: 0;
			return curChips + numAdded - numSubtracted;
		}

		Object.freeze(that);
		return that;
	};

	/**
	 * Create a size X size 2D array of cell objects. Initialize the neighbors of each cell object.
	 * 
	 * @param {size} number of rows (the same as number of columns) of the array
	 */
	var initializeGrid = function(size) {
		var g = [];
		for (var i = 0; i < size; i++) {
			g[i] = [];
			for (var j = 0; j < size; j++) {
				g[i][j] = cell();
			};
		};

		// Note: this setting corresponds to "torus" board
		for (var r = 0; r < size; r++) {
			for (var c = 0; c < size; c++) {
				if (r > 0) {
					g[r][c].addNeighbors([g[r-1][c]]);
				} else {
					g[r][c].addNeighbors([g[size-1][c]]);
				}
				if (r < (size-1)) {
					g[r][c].addNeighbors([g[r+1][c]]);
				} else {
					g[r][c].addNeighbors([g[0][c]]);
				}
				if (c > 0) {
					g[r][c].addNeighbors([g[r][c-1]]);
				} else {
					g[r][c].addNeighbors([g[r][size-1]]);					
				}
				if (c < (size-1)) {
					g[r][c].addNeighbors([g[r][c+1]]);
				} else {
					g[r][c].addNeighbors([g[r][0]]);
				}
			}
		}
		return g;
	};

	// One of the preset board configurations.
	var singlePile = function(size) {
		var g = initializeGrid(size);
		var center = Math.floor(size/2);
		g[center][center].setChips(100);
		return g;
	};

	// One of the preset board configurations.
	var doublePiles = function(size) {
		var g = initializeGrid(size);
		var center = Math.floor(size/2);
		g[center][center-1].setChips(100);
		g[center][center+1].setChips(100);
		return g;
	};

	// One of the preset board configurations.
	var fourPiles = function(size) {
		var g = initializeGrid(size);
		var center = Math.floor(size/2);
		g[center][center-1].setChips(50);
		g[center-1][center].setChips(50);
		g[center][center+1].setChips(50);
		g[center+1][center].setChips(50);
		return g;
	};

	var presetGrids = [singlePile(size), doublePiles(size), fourPiles(size)]
	// Default the current grid to the blinker grid
	var currentGrid = presetGrids[0];
	
	var subscribers = [];

	/**
	 * Subscribe to the changes of grid object. 
	 *
	 * @param {subscriber} a function that is executed whenever the grid object is changed.
	 */
	that.subscribe = function(subscriber) {
		subscribers.push(subscriber);
	}

	var publishChanges = function() {
		for (var i = 0; i < subscribers.length; i++) {
			subscribers[i]();
		}
	}

	// Return a size X size 2D array filled with the number of chips in each cell.
	that.printGrid = function() {
		return currentGrid.map(function(x) {
			return x.map(function(y) {
				return y.getChips();
			});
		});
	};

	/**
	 * For each cell, determine whether it needs to update. 
	 * Then update the cell if it needs to be updated. And publish the changes to subscribers.
	 */
	that.updateGrid = function() {
		nextGrid = currentGrid.map(function(x) {
			return x.map(function(y) {
				return y.nextChips();
			});
		});
		for (var r = 0; r < size; r++) {
			for (var c = 0; c < size; c++) {
				currentGrid[r][c].setChips(nextGrid[r][c]);
			};
		};
		publishChanges();
	};

	that.stepBackGrid = function() {
		for (var r = 0; r < size; r++) {
			for (var c = 0; c < size; c++) {
				currentGrid[r][c].stepBack();
			};
		};
		publishChanges();
	}

	/**
	 * Set the currentGrid to be one of the preset grids.
	 * Publish the changes to subscribers.
	 *
	 * @param {i} the index of the preset grid in presetGrids. Take values in {0, 1, 2}.
	 */
	that.chooseGrid = function(i) {
		currentGrid = presetGrids[i];
		publishChanges();
	};

	/**
	 * Update the status of the cell in position (r,c) in the 2D array.
	 * Publish the chagnes to subscribers.
	 *
	 * @param {r} the index of the row
	 * @param {c} the index of the column
	 */ 
	that.updateCell = function(r, c, inc) {
		currentGrid[r][c].setChips(currentGrid[r][c].getChips()+inc);
		publishChanges();
	};

	Object.freeze(that);
	return that;
}