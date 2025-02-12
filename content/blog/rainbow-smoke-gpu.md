An implementation of the Rainbow Smoke algorithm using GPU compute shaders through WebGPU, in JavaScript. You can try it yourself [if your browser supports WebGPU](https://caniuse.com/?search=web%20gpu):

[Link] (remember to add)

This post describes the origins and basic working principle of the algorithm and the GPU implementation.

put image

## Rainbow Smoke

Rainbow Smoke belongs to the generative art class of computer algorithms. Its origins lie in this Code Golf Stack Exchange [post](https://codegolf.stackexchange.com/questions/22144/images-with-all-colors) from 2014. The Code Golf site hosts many coding challenges. In this case it was a 1-week popularity contest launched by the community with the goal of finding the best approach to a simple problem, in summary: 

- Create an image purely algorithmically, that is, not using pictures or external information.
- Each pixel must have a unique color.
- Colors must evenly fill the RGB spectrum.

The example image, which technically fulfills the requirements but is not artistically pleasing:

![example](https://i.sstatic.net/B4e5u.png)

There were many interesting submissions, but "Rainbow Smoke", submitted by Hungarian user fejescoco, quickly became the clear winner. He himself hosts a little [website](http://rainbowsmoke.hu/home) where you can see a gallery of images crafted using his work, links to videos and articles talking about it. Indeed several news agencies back then picked up on the contest winner and it became quite popular. He explained it in a very graphic way here:

[![Test video](https://img.youtube.com/vi/OuvFsB4SLhA/0.jpg)](https://www.youtube.com/watch?v=OuvFsB4SLhA)

Throughout the years interested people have imagined different ways of building up on it, an example:

[![Test video](https://img.youtube.com/vi/dVQDYne8Bkc/0.jpg)](https://www.youtube.com/watch?v=dVQDYne8Bkc)



### The algorithm

The original implementation was a CPU single-threaded C# code with some performance issues, but enough for the mandatory 256x128 pixel image of the contest. However, to deliver on higher resolutions (and he went up to 4k, which you can see on his website) the code had to be improved on performance and partly made parallelizable. Simple version of it:

```vhdl
	procedure RainbowSmoke
        Create unique color X*Y array
        Shuffle order
        Place seed/s on new X*Y cell array
        Activate seed/s neighbors
        for i in range(X*Y)
        	Pick color i
            for every activated cell
                distance = averageTechnique() or minimumTechnique()
            end
            Paint cell with the smallest distance
            Activate its neighbors
        	Display cell array
        end
    end procedure
    procedure averageTechnique()
        distance = average L2-norm
```

