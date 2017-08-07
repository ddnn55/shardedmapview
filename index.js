import {ShardForGlobalView, Decimal} from './Shards';

function ShardedMapView({setActiveShard, setActiveShardView, initialView}) {

	let activeShard;

	const setView = view => {
		const newShard = ShardForGlobalView(view);
		if(!activeShard || !activeShard.isEqual(newShard)) {
			activeShard = newShard;
			setActiveShard(activeShard);
			console.info('switched active shard');
		}
		setActiveShardView(activeShard.globalViewToShardView(view));
	};

	setActiveShard(ShardForGlobalView(initialView));

	const instance = {
		setView,
		Decimal
	};

	return instance;
}

export default ShardedMapView;
