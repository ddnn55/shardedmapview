const Bounds = require('./Bounds');
const Decimal = require('./DecimalConfigured');

const D = num => new Decimal(num);

function tileCoordForPointAtZoom(point, zoom) {
	var factor = Decimal.pow(2, zoom - 8);
	//var tileX = factor + (point.x - 1) * factor;
	var tileX = factor.times(point.x);
	var tileY = factor.times(D(0).minus(point.y));
	return {x: tileX, y: tileY, z: zoom};
}

function Tile({zoom, row, column}) {
	const width = Decimal.pow(2, 8 - zoom);
	return {
		row: row,
		column: column,
		zoom: zoom,
		key: function() {
			return zoom + ',' + row.toString() + ',' + column.toString();
		},
		width: function() {
			return width;
		},
		bounds: function() {
			return Bounds({
				left:     column.times(width),
				right:   (column.plus(1)).times(width),
				top:     D(0).minus(row).times(width),
				bottom: (D(0).minus(row).minus(1)).times(width)
			});
		},
		getParent: function() {
			return Tile({
				zoom: zoom - 1,
				row: Decimal.floor(row.dividedBy(2)),
				column: Decimal.floor(column.dividedBy(2))
			});
		}
	};
}

Tile.tileForPointAtZoom = function(point, zoom) {
	var tileCoord = tileCoordForPointAtZoom(point, zoom);
	return Tile({
		column: Decimal.floor(tileCoord.x),
		row: Decimal.floor(tileCoord.y),
		zoom: tileCoord.z
	});
}

// return all tiles at given zoom level that overlap
// given bounds
Tile.tilesForBoundsAtZoom = function(bounds, zoom) {

	var upperLeftTile = module.exports.tileForPointAtZoom(
		{y: bounds.top, x: bounds.left}, zoom
	);
	var lowerRightTile = module.exports.tileForPointAtZoom(
		{y: bounds.bottom, x: bounds.right}, zoom
	);

	var tiles = [];
	for(var r = upperLeftTile.row; r.lessThanOrEqualTo(lowerRightTile.row); r = r.plus(1)) {
		for(var c = upperLeftTile.column; c.lessThanOrEqualTo(lowerRightTile.column); c = c.plus(1)) {
			// (function(_r, _c) {
				tiles.push(module.exports.Tile({
					row: r,
					column: c,
					zoom: zoom
				}));
			// })(r, c);
		}
	}
	return tiles;
}

module.exports = Tile;

/**** this is using an old api... *****/
// if main, run some tests
if (typeof require != 'undefined' && require.main==module) {

	function debugTilesForBoundsAtZoom(bounds, zoom) {
		console.log({bounds, zoom});
		var tiles = module.exports.tilesForBoundsAtZoom(bounds, zoom);
		console.log(tiles);
		console.log('-------------------------');
		return tiles;
	}
    
    debugTilesForBoundsAtZoom({
    	left: -28.03125, right: 0.59375, top: 8, bottom: -20.625
    }, 3);
    debugTilesForBoundsAtZoom({
    	left: -28.03125, right: 0.59375, top: 8, bottom: -20.625
    }, 4);
    debugTilesForBoundsAtZoom({
    	left: -28.03125, right: 0.59375, top: 8, bottom: -20.625
    }, 5);

    debugTilesForBoundsAtZoom({left: -3.873046875, right: 0.732421875, top: 1.43359375, bottom: -3.171875}, 6);
    debugTilesForBoundsAtZoom({left: -3.873046875, right: 0.732421875, top: 1.43359375, bottom: -3.171875}, 7);
    debugTilesForBoundsAtZoom({left: -3.873046875, right: 0.732421875, top: 1.43359375, bottom: -3.171875}, 8);
}
