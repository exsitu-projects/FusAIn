# FusAIn

## What is FusAIn?
In the [FusAIn research project](https://dl.acm.org/doi/10.1145/3706598.3714027) we developed FusAIn, a GenAI visual
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

This repository includes stable diffusion webui as a Git submodule: [stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui), located in the folder `stable-diffusion-webui`. This is to leverage its easy configuration on backend image generation model and capabilities with stable diffusion and ControlNet using its [API](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/API). 


### 1. (Original) Clone the repository with submodule and configure ControlNet

To clone this repository **with the submodule**, run:

```bash
git clone --recurse-submodules https://github.com/exsitu-projects/FusAIn.git
````

If you already cloned the repository **without submodules**, you can fetch the submodule using:
```bash
git submodule update --init --recursive
````
The installation will install SD 1.5 model by default, which is compatible with ControlNet configuration in FusAIn frontend. If you want to configure other base models or other ControlNets, please follow the instructions [here](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Features).

You can run the webui by running `webui-user.bat` or `webui-user.sh` depending on your OS. With stable diffusion webui installed and opened, follow the instructions in [sd-webui-controlnet](https://github.com/Mikubill/sd-webui-controlnet) to install ControlNet extension in `stable-diffusion-webui` and download ControlNet models then create a folder `ControlNet` inside the folder `stable-diffusion-webui/models` and put the models inside.

FusAIn uses these ControlNet models (which can be downloaded from [Hugging Face](https://huggingface.co/lllyasviel/ControlNet-v1-1/tree/main) ):
`control_v11p_sd15_softedge` 
`control_v11p_sd15_canny` 
`control_v11f1e_sd15_tile`  by default.

You can `set COMMANDLINE_ARGS=--api` at webui-user.bat on Windows to look at the API documentation. On Linux, you use webui-user.sh instead (remember to remove the # at the beginning.)

However, as models continue to evolve rapidly, you are encouraged to explore [other models](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Features) or [other compatible ControlNets](https://github.com/Mikubill/sd-webui-controlnet/wiki/Model-download), and configure their parameters inside `stores/canvasStore.js` by referring to [API documentation](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/API) and [ControlNet Guide](https://stable-diffusion-art.com/controlnet/).

### 1. (Alternative) Use a Custom Backend 
You can operate FusAIn in a frontend-only mode to integrate with any ControlNet-compatible Generative AI model. To do this, clone the repository without the backend submodule and perform the following configurations:

#### Payload Configuration
In `canvasStore.js`, modify the `textFirstGenerate` and `ImageFirstGenerate` functions to structure the payload according to your chosen model's API requirements.

####  API Endpoint Configuration
In `diffusion.js`, adapt the backend API calls to target your custom endpoint.

### 2. Install dependencies
Please run
```sh
npm install
```
in both root directory and `/server` folder.

### 3. Use the Unsplash image search feature
Get an Unsplash API key by creating a developer account at [Unsplash Developers](https://unsplash.com/developers) and create a new application to get your access key. Then create a `.env` file in the root directory and add your Unsplash API key:
```
UNSPLASH_API_KEY="Your_Unsplash_API_Key"
```

### 4. Compile and Hot-Reload for Development (both front end and back end)

```sh
npm run dev
```
Then your app should be running at `http://localhost:3000`.

## Note:
The main canvas uses on HTML5 Pointer Events to detect pen or mouse input. However, the behavior may vary depending on the browser. [Learn more about Pointer Events.](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)

## Publication
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
This repository contains both original code (licensed under MIT) and portions derived from AGPL-licensed projects.

- Original FusAIn code — Licensed under the [MIT License](LICENSE).
- Portions derived from:
    - [AUTOMATIC1111/stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui)
    - [Mikubill/sd-webui-controlnet](https://github.com/Mikubill/sd-webui-controlnet)

  These portions are licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](https://www.gnu.org/licenses/agpl-3.0.html).

