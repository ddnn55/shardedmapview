import {ShardForGlobalView, ShardLocalBounds} from './Shards';
import Bounds from './Bounds';

function ShardedMapView({setActiveShard, setActiveShardView, initialView, shardExtent}) {

	const shardCoordToUserShardCoord = ShardLocalBounds.transformerTo(shardExtent);

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

	setActiveShard(ShardForGlobalView(initialView));

	const instance = {
		setView
	};

	return instance;
}

ShardedMapView.Bounds = Bounds;

export default ShardedMapView;
