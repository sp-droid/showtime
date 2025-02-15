My ESA internship took place during 2023 at the European Astronaut Centre (Cologne, Germany), as ML and software engineer for the CAVES & Pangaea group. Concretely, I worked in the Pangaea team for Igor Drozdovsky. Both segments are courses, with Pangaea focusing on the training of astronauts in geology, taking them (as of 2023) to 4 locations with different geologic characteristics: Lofoten (Norway), Ries crater (Germany), Bletterbach (Dolomites, Italy) and the island of Lanzarote (Spain). I come from Lanzarote by the way, did that play a part in the selection!?

<img src="https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2019/01/lunar_setting/19205792-1-eng-GB/Lunar_setting_pillars.jpg" alt="Lanzarote is of geologic interest due to its recent volcanic activity. Source@esa.int" style="zoom:50%;" />

As this is work, I won't share any concrete details.

[toc]

## Mineral Spectra ML Classifier

Among other tasks, Igor manages a fluctuating group of interns that research and develop mineral/element recognition tools for the field trips. I arrived in July and the annual Pangaea tour was going to take place in September, when they would visit Lanzarote. My immediate goal was to design and train an ML classifier that would be executed on a device called EFB when an astronaut picked up a rock and used the handheld VNIR spectrometer on it.

<img src="https://m.media-amazon.com/images/I/5157F1MUymL.jpg" alt="VNIR spectrometer's example output. Source@amazon.com" style="zoom: 25%;" />

Quite a few interns had attacked the same problem before. Models were built and specialized for the equipment at hand (spectrometer quality, spectral bands, measurement type), collected data and geological region of interest. Talking about the specific architecture I ended up going for is off-reach, but the type was a 2D-CNN. After many hours tweaking the architecture,  hyperparameters tuning, data pre-processing (including manually removing outliers for 5000 spectra in about 60 classes...), validation... 

<img src="assets/esa-internship-classImbalance.jpg" alt="One of the main challenges: class imbalance. Every column represents #samples per class." style="zoom: 50%;" />

The result was an adequately sized model that was, in their own words, "the best one to date"! The following is an extract from the final presentation:

- Runs **fast on the EFB**
- **Performs well on the validation set** globally and in most classes
- Supports **many more mineral species** than before
- And **performed well in the real world**

I wouldn't attribute the success to any part alone, though for sure the most painful one was removing outliers. The data was shaped in a way that made very difficult either ignoring them or automatically detecting them, due to their high proportion, high number of classes... So I decided to brute-force it, manually learning how the spectra of a certain class looked, aided by class average / median / percentile plots. This work is very specific for the spectrometer's spectral range so the outliers will need to be re-evaluated once they change it.



## Data Portal Proof of Concept

After the mission in September, I could choose the next topic I would work on for the remaining half of the internship. Of the several I was given, I got curious about the idea of developing a Data Portal PoC for the team:

- Our data repository lacked spectra on many minerals and elements. This would give geologists outside ESA an easier way to donate their data and help us fill those gaps.
- As per ESA policy, it wasn't possible to share field trip spectra, models and other proprietary information, except data obtained externally. The platform could additionally bridge different data collections.
- There wasn't anything similar in capabilities and reach.
- We couldn't share them, but we could offer in-browser usage of our models.
- In-browser model training based on available data
- Statistical analysis of results

<img src="assets/esa-internship-dataportal.jpg" alt="Pitched idea for a proposed, more advanced section of the portal." style="zoom: 80%;" />

There were challenges:

- We would need permission for an ESA hosting license.
- There were many issues regarding ESA policy, expectations and different views in the team on how or even if to tackle the problem.
- The team had setup data and model training separately, and they had never been used together in an automatic way, or designed for a consistent output. Model saving had to be standardized and many functions end points had to be tweaked. Data portal aside, these developments were deemed quite positive for the future consistency and interoperability of everything.
- Time constraint: concept design, preliminary requirements definition, a proof of concept and tying everything up for next interns or future progress, in 3 months.

In the end, the idea was brought to life and presented with very positive reception. However, the interns profile not focusing on web development coupled with the ephemeral nature of the internships themselves means any meaningful progress on the idea will take at least a year for it to even begin. Time will tell, but certainly I am very satisfied with both ends of my work there. 



## Human Aspect

In the personal domain, I grew substantially during my stay in Cologne. More than a year has passed since I left, and I've had time to reflect on this experience. It wasn't always perfect, but it was extraordinary to be there. It's difficult to pinpoint the exact reason, I don't know yet. What I can say though, is that I've been living out of my home since I was 17, in different cities and countries, and only after this experience and some time to process it, I'm ready to face whatever is in front of me. It wasn't me just feeling well; I have very fond memories of my time in high school in Lanzarote, and during the first years of my bachelors in Madrid; it was also feeling the world was smaller. I guess that's how I can describe it now.

With respect to my most immediate colleagues, they received me well when I first arrived, but with the exception of Verena (YGT), all of them were leaving less than 2 months into my own stay, and the team was fairly small. After this I suddenly became the *veteran* (:sunglasses:) and new interns swelled up our ranks. I tried my best to help them throughout, and soon I found them making things better for me in different ways. Each and every one of them were so funny and unique. The atmosphere was really good and I'll probably chase that kind of work relationship forever. All of them were great people, I can attest for Igor being good at finding character and integrity.

There's more to it than this, but it's not right for this post.



Working for ESA was incredible and I'd love to repeat it. Aside from internships it could be also interesting for the young reader to check post-graduate programs such as the [EGT (used to be YGT)](https://www.esa.int/About_Us/Careers_at_ESA/Graduates_ESA_Graduate_Trainees) or the lesser known [JPP](https://www.esa.int/About_Us/Careers_at_ESA/Junior_Professional_Programme). Thank you for reading!

<img src="https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2022/01/esa_graduate_trainee_programme/23903523-3-eng-GB/ESA_Graduate_Trainee_Programme_article.png" alt="EGT 2025 call. Source@esa.int"  />
