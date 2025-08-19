# FusAIn

## UPDATES:
We’re currently working on building a new tool. The code for this project will be released around September–October 2025. Thanks for your patience!

P.S. The implementation is quite straightforward—you can easily replicate it by referring to the technical implementation of our publication in the meantime.

## What is FusAIn?
FusAIn is a GenAI visual
prompt composition tool that lets creators interact with personalized
pens by loading them with visual objects or attributes such as color or
texture. GenAI then fuses the pen’s contents to create controllable images that matches the composition.
<figure>
  <img src="public/assets/images/teaser.png" alt="Image description">
  <figcaption>FusAIn: A pen-based GenAI visual prompt composition tool where designers use (1) Source panel for image search,
upload, and display. They extract visual properties with “smart” pens from (2) Pen sets (object, color, texture, basic, eraser) and
compose visual prompts on (3) Canvas with editing tools. They can add additional text prompts at (4) Text prompt area, and
use (5) Brush scope visualizing pen status. (6) Generation modes include Guided Generate and Merge. The result appears in (7)
Generation panel with style lock, and can be added to (8) Image gallery.</figcaption>
</figure>

## Installation

```sh
npm install
```

### Compile and Hot-Reload for Development (both front end and back end)

```sh
npm run dev
```
### Note:
The main canvas uses on HTML5 Pointer Events to detect pen or mouse input. However, the behavior may vary depending on the browser. [Learn more about Pointer Events.](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
### Publication
```bibtex
@inproceedings{
    peng2025:fusain,  
    title = {FusAIn: Composing Generative AI Visual Prompts using
    Pen-based interaction},  
    author = {Peng, Xiaohan and Koch, Janin and Mackay, Wendy E.},  
    year = {2025},  
    publisher = {Association for Computing Machinery},  
    isbn = {979-8-4007-1394-1/25/040},  
    url = {https://doi.org/10.1145/3706598.3714027},  
    address = {New York, NY, USA},  
    pages = {20},  
    doi = {10.1145/3706598.3714027},  
    series = {CHI '25},  
    location = {Yokohama, Japan}  
}  
```
### License
MIT License