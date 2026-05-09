"use strict";
const loadMaps = async () => {
    const manifest = await fetch("resources/maps/manifest.json").then((res) => res.json());
    console.log(Object.keys(manifest).length + " maps found in manifest:", manifest);
    const mapsToLoad = Object.entries(manifest);
    const numMapsToLoad = mapsToLoad.length;
    let mapsLoaded = 0;
    for (const [id, path] of mapsToLoad) {
        const mapData = await fetch(`resources/maps/${path}`).then((res) => res.json());
        mapData.layers.base = editor.decodeLayer(mapData.layers.base);
        mapData.layers.props = editor.decodeLayer(mapData.layers.props);
        mapManager.addMap(mapData);
        mapsLoaded++;
        console.log(`Loaded map ${id} (${mapsLoaded}/${numMapsToLoad})`);
    }
    console.log(`Finished loading maps (${mapsLoaded}/${numMapsToLoad})`);
    if (DEV_MODE.IS_ENABLED()) {
        devInit();
    }
};
loadMaps().then(() => {
    console.log("Maps loaded:", Array.from(mapManager.maps.keys()));
});
//# sourceMappingURL=load_maps.js.map