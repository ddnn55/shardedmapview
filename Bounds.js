
const Decimal = require('./DecimalConfigured');

const D = num => new Decimal(num);

const pointToString = p => `${D(p.x).toString()}, ${D(p.y).toString()}`;

module.exports = function Bounds({left, right, top, bottom}) {

	function width() {
		return D(right).minus(left);
	}

	function height() {
		return D(top).minus(bottom);
	}

	function aspect() {
		return width().dividedBy(height()).toNumber();
	}

	let instanceApi = {
		
		toString: () => `${D(left).toString()}, ${D(right).toString()}, ${D(top).toString()}, ${D(bottom).toString()}`,

		diagonal: () => Decimal.hypot(D(left).minus(right), D(top).minus(bottom)),

		normalizePoint: function(point) {
			return {
				x: D(point.x).minus(left).dividedBy(width()),
				y: D(point.y).minus(bottom).dividedBy(height())
			};
		},
		
		denormalizePoint: function(point) {
			return {
				x: D(left).plus(D(point.x).times(width())),
				y: D(bottom).plus(D(point.y).times(height()))
			};
		},

		transformerTo: function(toBounds) {
			return point => {
				// console.log('transforming', pointToString(point));
				const normalizedPoint = instanceApi.normalizePoint(point);
				// console.log('normalizedPoint', pointToString(normalizedPoint));
				const denormalizedPoint = toBounds.denormalizePoint(normalizedPoint)
				// console.log('transformed ', pointToString(denormalizedPoint));
				// console.log('fromBounds', instanceApi.toString());
				// console.log('toBounds  ', toBounds.toString());
				// console.log('-----------');
				return denormalizedPoint;
			};
		},

		boundsTransformerTo: function(toBounds) {
			const transform = instanceApi.transformerTo(toBounds);
			return bounds => {
				// console.log('in inner,', {toBoundsDiag: toBounds.diagonal()});
				// console.log('in inner,', {boundsDiag: bounds.diagonal()});
				// console.log('in inner,', {instanceApiDiag: instanceApi.diagonal()});
				const topLeft = transform({
					x: bounds.getLeft(),
					y: bounds.getTop()
				});
				const bottomRight = transform({
					x: bounds.getRight(),
					y: bounds.getBottom()
				});
				const b = Bounds({
					left: topLeft.x,
					right: bottomRight.x,
					top: topLeft.y,
					bottom: bottomRight.y
				});
				return b;
			}
		},

		getUpperLeft: function() {
			return {
				x: left,
				y: top
			};
		},

		getLowerRight: function() {
			return {
				x: right,
				y: bottom
			};
		},

		getLeft: () => left,
		getRight: () => right,
		getTop: () => top,
		getBottom: () => bottom,

		containedBoundsWithAspect: function(newAspect) {
			if(newAspect < aspect()) {
				// move left/right in
				const finalWidth = height().times(newAspect),
				      excessWidth = width().minus(finalWidth);
				return Bounds({
					left: left.plus(excessWidth.dividedBy(2)),
					right: right.minus(excessWidth.dividedBy(2)),
					top: top,
					bottom: bottom
				});
			}
			else {
				// move top/bottom in
				const finalHeight = width().dividedBy(newAspect),
				      excessHeight = height().minus(finalHeight);
				return Bounds({
					left: left,
					right: right,
					top: top.minus(excessHeight.dividedBy(2)),
					bottom: bottom.plus(excessHeight.dividedBy(2))
				});
			}
		}

	};
	return instanceApi;
}

