function ShardedMapView({setActiveShard, setActiveShardView}) {

	console.log('initialized a ShardedMapView');

	const setView = view => {
		setActiveShardView({
			zoom: view.zoom,
			center: view.center
		});
	};

	setActiveShard([0,0,0]);

	const instance = {
		setView
	};

	return instance;
}

export default ShardedMapView;
