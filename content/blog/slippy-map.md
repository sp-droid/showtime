[**Try it yourself**](../../content/projects/slippyMap/11.html)
======

---

An implementation of the "slippy map" that were used at some point in map applications such as Google Maps.

- **V1**

  No zoom for now, draws every tile in the world

- **V2**

  Draws only visible tiles

- **V3**

  Cache tiles in an array

- **V4**

  Keys in a hashmap, pseudo-LRU cache instead of ring buffer, parallel loads, o(1) cache eviction

- **V5**

  Neighbor preloading in the 3 closest levels

- **V6**

  Only recompute cache request queue when the camera moves instead of at every frame
  
- **V7**
  
  Zoomable

- **V8**

  Continuous zoom, zoom level 0 removed, changed preload cache priority on zoom out tiles, painted loading and cache loaded tiles, touchscreen support
  
- **V9**

  Zoom can go below 0 so all tile levels can be seen. Tile generation is done with my majority filter I talked about in another blog post (discrete bilinear interpolation), instead of nearest neighbours. Result is pixels no longer jump between tile sizes, they are consistent.

- **V10**

  Tiles are uploaded once, not copied and re-uploaded every frame. Using webGL. Now a fragment shader picks the drawn pixel on the screen using the majority filter, instead of nearest neighbours, resulting in diagonals and curves between different zones. To accomodate this 2x2 filter, tiles contain a 1 pixel-wide border, 258x258. Results in higher perceived detail even if tiles are the same.
- **V11**
  Noise warping of the fragment shader pixel location with 3 noise scales. Even higher perceived detail. It's an implementation of the same noise warping done in the discrete bilinear interpolation blog post.