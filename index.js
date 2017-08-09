const {ShardForGlobalView, ShardLocalBounds} = require('./Shards');

function ShardedMapView({setActiveShard, setActiveShardView, initialView, shardExtent}) {

	const shardCoordToUserShardCoord = ShardLocalBounds.transformerTo(shardExtent);
	const userShardCoordToShardCoord = shardExtent.transformerTo(ShardLocalBounds);

	let activeShard;

	const setView = view => {
		const newShard = ShardForGlobalView(view);
		if(!activeShard || !activeShard.isEqual(newShard)) {
			activeShard = newShard;
			setActiveShard(activeShard);
			console.info('switched to shard w/ zoom ' + activeShard.zoom());
		}
		const intermediateShardView = activeShard.globalViewToShardView(view);
		
		const userShardView = shardCoordToUserShardCoord(intermediateShardView.center);
		setActiveShardView({
			zoom: intermediateShardView.zoom,
			center: {
				x: userShardView.x.toNumber(),
				y: userShardView.y.toNumber()
			}
		});
	};

	// setActiveShard(ShardForGlobalView(initialView));
	setView(initialView);

	const instance = {
		setView,
		activeShardCoordToGlobalCoord: point => {
			const shardCoord = userShardCoordToShardCoord(point);
			const userShardCoord = activeShard.localCoordToGlobalCoord(shardCoord);
			return {x: userShardCoord.x.toString(), y: userShardCoord.y.toString()};
		}
	};

	return instance;
}

ShardedMapView.Bounds = require('./Bounds');
ShardedMapView.DecimalConfigured = require('./DecimalConfigured');
ShardedMapView.Shards = require('./Shards');

module.exports = ShardedMapView;
