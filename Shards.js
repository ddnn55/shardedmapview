
const Decimal = require('./DecimalConfigured');

const Bounds = require('./Bounds');

const D = num => new Decimal(num);

const GLOBAL_SIZE = 256;
const SHARD_LOCAL_SIZE = GLOBAL_SIZE;

const SHARD_ZOOM_PADDING = 6;
const SHARD_ZOOM_SPAN = 24;

const stepFloor = (value, step) => (
  D(step).times((D(value).dividedBy(step)).floor())
);

const stepRound = (value, step) => (
  step * Math.round(value / step)
);

const shardSizeAtZoom = zoom => D(GLOBAL_SIZE).dividedBy(D(2).toPower(zoom));


const pointToString = p => `${D(p.x).toString()}, ${D(p.y).toString()}`;

const ShardLocalBounds = Bounds({
  left: 0,
  right: SHARD_LOCAL_SIZE,
  top: 0,
  bottom: SHARD_LOCAL_SIZE
});

const ShardInnerBounds = Bounds({
  left: SHARD_LOCAL_SIZE / 2,
  top: SHARD_LOCAL_SIZE / 2,
  right: SHARD_LOCAL_SIZE / 2 + SHARD_LOCAL_SIZE / Math.pow(2, SHARD_ZOOM_PADDING),
  bottom: SHARD_LOCAL_SIZE / 2 + SHARD_LOCAL_SIZE / Math.pow(2, SHARD_ZOOM_PADDING)
});

const Shard = ({origin, zoom}) => ({
  globalBounds: () => Bounds({
    left: origin.x,
    right: origin.x.plus(shardSizeAtZoom(zoom)),
    top: origin.y,
    bottom: origin.y.plus(shardSizeAtZoom(zoom))
  }),
  localBounds: () => {
    throw new Error('Removed Shard.localBounds(). Use Shards.ShardLocalBounds');
  },
  isEqual: otherShard => (
    zoom === otherShard.zoom() &&
    origin.x.equals(otherShard.origin().x) &&
    origin.y.equals(otherShard.origin().y)
  ),
  zoom: () => zoom,
  origin: () => origin,
  row: () => origin.y.dividedBy(shardSizeAtZoom(zoom)),
  column: () => origin.x.dividedBy(shardSizeAtZoom(zoom)),
  localTileCoordToGlobalTileCoord: localTileCoord => {
    const shard = Shard({origin, zoom})
    // const globalZoom = shardZoomToGlobalZoom(localTileCoord.z, shard);
    // console.log({shardOrigin: pointToString(shard.origin()), shardZoom: shard.zoom()});
    // const shardSize = shardSizeAtZoom(zoom);
    // const globalY = Decimal.pow(2, globalZoom)//.times(-1)//.minus(Decimal.pow(2, shard.zoom() + localTileCoord.z));
    // TODO shard.origin() must figure in 👆 as well

    const localZoomShardSizeInTiles = Decimal.pow(2, localTileCoord.z - SHARD_ZOOM_PADDING);
    const paddingTilesTopAndLeft = Math.pow(2, SHARD_ZOOM_PADDING + localTileCoord.z - SHARD_ZOOM_PADDING - 1);

    const globalY = shard.row().times(localZoomShardSizeInTiles).plus(localTileCoord.y - paddingTilesTopAndLeft);
    const globalX = shard.column().times(localZoomShardSizeInTiles).plus(localTileCoord.x - paddingTilesTopAndLeft);

    const globalZ = shardZoomToGlobalZoom(localTileCoord.z, shard);

    // console.info(`shard: ${zoom}, ${shard.row()}, ${shard.column()}; local: ${localTileCoord.z}, ${localTileCoord.y}, ${localTileCoord.x}; global: ${globalZ}, ${globalY}, ${globalX}`);

    return {
      z: globalZ,
      y: globalY,
      x: globalX
    };
  },
  globalViewToShardView: globalView => globalViewToShardView(globalView, Shard({origin, zoom})),
  localCoordToGlobalCoord: point => shardCoordToGlobalCoord(point, Shard({origin, zoom}))
});

const shardCoordToGlobalCoord = (shardCoord, shard) => {
  return ShardInnerBounds.transformerTo(shard.globalBounds())(shardCoord);
};

const ShardForGlobalView = (globalView) => {
  const shardZoom = stepFloor(globalView.zoom, SHARD_ZOOM_SPAN).toNumber();
  // const shardZoom = stepRound(globalView.zoom, SHARD_ZOOM_SPAN);
  return Shard({
    origin: {
      x: stepFloor(globalView.center.x, shardSizeAtZoom(shardZoom)),
      y: stepFloor(globalView.center.y, shardSizeAtZoom(shardZoom))
    },
    zoom: shardZoom
  })
};

const globalCoordToShardCoord = (globalCoord, shard) => {
  const globalBounds = shard.globalBounds();
  const transformedPoint = globalBounds.transformerTo(ShardInnerBounds)(globalCoord);
  return {
    x: transformedPoint.x.toNumber(),
    y: transformedPoint.y.toNumber()
  };
};

const globalViewToShardView = (globalView, shard) => {
  const view = {
    center: globalCoordToShardCoord(globalView.center, shard),
    zoom: globalZoomToShardZoom(globalView.zoom, shard)
  };
  // console.log('view', view);
  return view;
};

const globalZoomToShardZoom = (globalZoom, shard) => globalZoom - shard.zoom() + SHARD_ZOOM_PADDING;

const shardZoomToGlobalZoom = (shardZoom, shard) => shardZoom - SHARD_ZOOM_PADDING + shard.zoom();


module.exports = {ShardForGlobalView, Decimal, ShardLocalBounds};


