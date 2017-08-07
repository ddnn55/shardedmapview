import {ShardForGlobalView} from './Shards';

function ShardedMapView({setActiveShard, setActiveShardView, initialView}) {

	console.log('initialized a ShardedMapView');

	const setView = view => {
		setActiveShardView({
			zoom: view.zoom,
			center: view.center
		});
	};

	setActiveShard(ShardForGlobalView(initialView));

	const instance = {
		setView
	};

	return instance;
}

export default ShardedMapView;
