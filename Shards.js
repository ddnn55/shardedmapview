
import Decimal from 'decimal.js';

const D = num => new Decimal(num);

const GLOBAL_SIZE = 256;
const SHARD_LOCAL_SIZE = GLOBAL_SIZE;

const SHARD_ZOOM_PADDING = 8;
const SHARD_ZOOM_SPAN = 32;

const stepFloor = (value, step) => (
  D(step).times((D(value).dividedBy(step)).floor())
);

const shardSizeAtZoom = zoom => D(GLOBAL_SIZE).dividedBy(D(2).toPower(zoom));




const Shard = ({origin, zoom}) => ({
  globalBounds: () => Bounds({
    left: origin.x,
    right: origin.x.plus(shardSizeAtZoom(zoom)),
    top: origin.y,
    bottom: origin.y.plus(shardSizeAtZoom(zoom))
  }),
  localBounds: () => Bounds({
    left: 0,
    right: SHARD_LOCAL_SIZE,
    top: 0,
    bottom: SHARD_LOCAL_SIZE
  }),
  isEqual: otherShard => (
    zoom === otherShard.zoom() &&
    origin.x.equals(otherShard.origin().x) &&
    origin.y.equals(otherShard.origin().y)
  ),
  zoom: () => zoom,
  origin: () => origin,
  localTileCoordToGlobalTileCoord: localTileCoord => ({
    z: localTileCoord.z,
    y: D(localTileCoord.y),
    x: D(localTileCoord.x)
  })
});

const shardCoordToGlobalCoord = (shardCoord, shard) => {
  return shard.localBounds().transformerTo(shard.globalBounds())(shardCoord);
};

const ShardForGlobalView = (globalView) => {
  const shardZoom = stepFloor(globalView.zoom, SHARD_ZOOM_SPAN).toNumber();
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
  const localBounds = shard.localBounds();
  const transformedPoint = globalBounds.transformerTo(localBounds)(globalCoord);
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


export {ShardForGlobalView, Decimal};


