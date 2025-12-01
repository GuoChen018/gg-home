The white card is created by following [this article](https://jakub.kr/work/shadows) by Jakub Krehel. I highly recommend giving it a read and following his content. Instead of using `border`, he recommends using `box-shadow` instead to add more depth to the element. 

```css
box-shadow: 
    0px 0px 0px 1px rgba(0, 0, 0, 0.1),
    0px 1px 2px -1px rgba(0, 0, 0, 0.06),
    0px 2px 4px 0px rgba(0, 0, 0, 0.04)
;
```

For the dark card, there wasn't any clear tutorials. So, I re-used the technique above and applied an uniform inner highlight via `inset`. It's a simpler build than [this guide](https://x.com/PixelJanitor/status/1623358575904194562?s=20) by Derek Brigg.

```css
box-shadow: 
    inset 0px 0px 0px 1px rgba(255, 255, 255, 0.06),
    0px 0px 0px 1px rgba(0, 0, 0, 0.1),
    0px 1px 2px -1px rgba(0, 0, 0, 0.06),
    0px 2px 4px 0px rgba(0, 0, 0, 0.04)
;
```

To make the transition smooth, I added subtle `ease-out` to both the scale transform and the box shadow. I chose `ease-out` because the acceleration at the beginning gives user a sense of responsiveness. Learned that from Emil's [Animations on the Web](https://animations.dev/learn). 

```css
transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
```

For the click interaction, I added a scale down transition to make the cards feel even more responsive. 

```css
transform: scale(0.98);
```