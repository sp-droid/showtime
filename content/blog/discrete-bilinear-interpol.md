A description into a pixel sampling algorithm I started using for a long term project of mine.

[toc]

## Motivation

This long term project involves rendering a map of the world among other challenges. Going at it I quickly found out how even 16K images were quite blurry when zooming in at otherwise (in other similar projects) reasonable levels, for example:

[Extract of the Strait of Gibraltar area]

If, when zooming in, we use a Nearest Neighbors filter on the fragment shader, each pixel on the screen will adopt the color of the nearest square, which produces a pixelated look if the zoom is low enough. It is possible to mitigate this problem in at least two main ways:

- **Bilinear interpolation**. The 4 nearest squares' colors (up, down, left, right) are sampled, weighted according to their distance, and mixed.

[Bilinear interpolation algorithm.]

The result is a color gradient appearing, blurring the frontier between different colors. It solves the problem of blocky edges and serrated diagonals:

[Bilinear interpolation.]

- **Stacked noise layers**. Adding noise (i.e. 2D Perlin) to the x and y coordinates of the pixel at different noise levels can create the perception of fine details and stray further from the pixelated look.

[Bilinear interpolation with noise.]

This makes it possible to represent the 16K texture at an, in practice, much higher resolution and detail. I find that, with good fine-tuning, noise expands rather than dilutes the features represented in the original image.

The approach works for a regular texture, but not for one with discrete values. For example, instead of terrain we have a province map with 4 thousand territories, each one represented by a unique integer. Other instances of a similar behavior could be ownership and terrain type maps, anything that represents discrete values instead of continuous colors. In this case, if we were to use bilinear interpolation and there was a spot surrounded by, let's say, province IDs 200, 1, 1 and 1, the bilinear average could be any float between 200 and 1. Rounding doesn't solve the issue, because the result should be either 1 or 200, not any province with an ID in between. This works only with binary states like sea/land. For example, let's clamp and color accordingly the previous bilinear interpolation result:



## Discrete bilinear interpolation

Let's imagine a screen pixel in the original coordinates of the image:

[image with pixel and 4 nearby squares]

```vhdl
procedure DBI
    left, right, top, bottom values are sampled
    
end procedure
```

In essence, it's the same algorithm, with a few extra steps:

- 4 scores are computed. For example, for bottom right square A and a pixel P: (Ax-Px) $\cdot$ (Ay-Py)
- A 4 dimensional vector is filled in a nested for loop i = 0...3 and j = 0...3. Score j is added to the i~th~ element:
  - If i = j
  - If the integers associated with squares j and i are equal
- Finally the index of the vector with the biggest sum is used to pick the 
