[**Try it yourself**](../../content/projects/slippyMap/8.html)
======

---

An implementation of the "slippy map" that were used at some point in map applications such as Google Maps.

- [**V1 link**](../../content/projects/slippyMap/1.html) 

  No zoom for now, draws every tile in the world

- [**V2 link**](../../content/projects/slippyMap/2.html)

  Draws only visible tiles

- [**V3 link**](../../content/projects/slippyMap/3.html)

  Cache tiles in an array

- [**V4 link**](../../content/projects/slippyMap/4.html)

  Keys in a hashmap, pseudo-LRU cache instead of ring buffer, parallel loads, o(1) cache eviction

- [**V5 link**](../../content/projects/slippyMap/5.html)

  Neighbor preloading in the 3 closest levels

- [**V6 link**](../../content/projects/slippyMap/6.html)

  Only recompute cache request queue when the camera moves instead of at every frame
  
- [**V7 link**](../../content/projects/slippyMap/7.html)
  
  Zoomable

- [**V8 link**](../../content/projects/slippyMap/8.html)

  Continuous zoom, zoom level 0 removed, changed preload cache priority on zoom out tiles, painted loading and cache loaded tiles, touchscreen support



Things to improve:

- Visual pop on zoom changes using the floor zoom level
- 