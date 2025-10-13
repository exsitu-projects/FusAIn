import { defineStore } from "pinia";
import { uploadFile } from "@/apis/upload";
import {
  generateT2I,
  generateI2I,
} from "@/apis/diffusion";
import { extractLasso } from "@/apis/extractLasso";
import { saveImgFile } from "@/apis/saveImgFile";
import { createLocalMask } from "@/apis/createLocalMask";
import { createColorMask } from "@/apis/createColorMask";
import { createCombinedMask } from "@/apis/createCombinedMask";
import { downloadImg, searchUnsplash } from "@/apis/unsplash";
export const useCanvas = defineStore("objects", {
  state: () => ({
    //image
    dropped: false,
    searchString: "",
    numSearchResult: 30,
    searchPromiseState: {
      loading: false,
      data: [],
      error: null,
    },
    imageObjectList: [],
    imgSource: 0,
    searchImgList: [],
    currentImageId: 0,
    lastImageId: 0,
    files: [],
    //image sidebar
    transparentMaskList: [],
    generatedBase64Url: null,
    //upload image counter
    uploadImageCounter: 0,
    //canvas upload image array
    extractImgArr: [],
    //seed count to keep track of history
    seedCount: 0,
    uploadAreaImgSize: 300, //depending on the width of upload window
    //Local gen AI position array
    localAiPosArr: [],
    //local mask
    maskBase64: null,
    colorMaskBase64: null,
    //pen status
    currentPenId: 0,
    //current color palette
    currentColorPalette: null,
    currentColor: null,
    //generated image dimension
    genImgResolution: 1024,
    //color of pen tip
    penTipColor: "black",
    //used for texture layer
    currentExtractPath: "",
    textureMaskPath: "",
    combinedMaskBase64: null,
    //brush properties
    brush: { color: "#000000", size: "15", gap: 0, whRatio: 0 },
    eraser: { color: "#ffffff", status: false },
    //color canvas
    colorSource: 0, //0:self defined; 1:from extracted palette
    //show img editing modal
    showImgEditModal: false,
    //extract
    currentExtract: { path: "", width: 100, height: 100, id: 0 },
    //which image id is selected
    currentSelectionId: null,
    processMode: 0, //0: manual erase 1: auto erase
    bgRemPromise: { isLoading: false, data: false },
    generationPromise: { isLoading: false, data: false },
    //gallery
    galleryImgArr: [],
  }),
  actions: {
    setCurrentImageId(id) {
      this.currentImageId = id;
    },

    //process uploaded images
    async addImageToCanvas(id, src, dimension) {
      const newImageId = this.imageObjectList.length;
      this.dropped = true;
      if (newImageId !== 0)
        this.imageObjectList[newImageId - 1].resizeActivate = false;
      this.setCurrentImageId(newImageId);

      this.imageObjectList.push({
        id: newImageId, // the id is the image id on canvas
        originalId: id, //this id is the id retrieved from api
        url: src,
        type: "image",
        tags: [],
        clipActivate: false,
        resizeActivate: false,
        w: this.uploadAreaImgSize,
        h: (this.uploadAreaImgSize * dimension.height) / dimension.width,
      });

      this.lastImageId++;
    },

    async imgDownload(id) {
      const url = this.searchImgList[id].download_location;
      await downloadImg(url);
    },

    async selectFile(files) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      this.files = [];
      for (let file of files) {
        if (!allowedTypes.includes(file.type)) {
          alert("File types allowed are jpeg, jpg, and png.");
        } else if (file.size > 20000000) {
          alert("File is too large, max size allowed is 20mb.");
        } else if (file.length > 15) {
          alert("You can upload 15 files maximum at a time.");
        } else {
          this.files.push(file);
        }
      }
      await this.submitFile();
    },

    async extractLassoWithTimeout(
      id,
      partCounter,
      maskUrl,
      extractPayload,
      imgFitWidth,
      imgFitHeight,
      timeout = 5000, // Set timeout to 5 seconds by default
    ) {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("extractLasso operation timed out after 5 seconds"));
        }, timeout);
      });

      // The extractLasso async operation
      const extractOperation = extractLasso(
        id,
        partCounter,
        maskUrl,
        extractPayload,
        imgFitWidth,
        imgFitHeight,
      );

      try {
        // Use Promise.race to either get the extract result or timeout
        let extractImgData = await Promise.race([
          extractOperation,
          timeoutPromise,
        ]);
        console.log("extractLasso completed successfully:", extractImgData);
        return extractImgData;
      } catch (error) {
        // Handle timeout or other errors
        console.error("Error:", error.message);
        if (error.message.includes("timed out")) {
          // Handle the timeout scenario specifically
          console.log(
            "The extractLasso operation took too long and was canceled.",
          );
        }
        throw error; // Optionally rethrow the error to handle it further up the call stack
      }
    },

    async updateExtractToCanvas(
      id,
      maskUrl,
      extractPayload,
      imgFitWidth,
      imgFitHeight,
    ) {
      function findLastIndexByProperty(arr, propName, propValue) {
        for (let i = arr.length - 1; i >= 0; i--) {
          if (arr[i][propName] === propValue) {
            return i;
          }
        }
        return -1;
      }

      const existingImageIndex = findLastIndexByProperty(
        this.extractImgArr,
        "idFromUpload",
        id,
      );

      let partCounter;
      if (existingImageIndex === -1) {
        partCounter = 0;
      } else {
        partCounter = this.extractImgArr[existingImageIndex].idFromPart + 1; //PART COUNTER ALWAYS ADD FROM LAST
      }

      this.transparentMaskList.push({
        id: id,
        partId: partCounter,
        url: maskUrl,
      });
      //send the semi transparent mask
      //cut the lassoed area out of original image
      const allGreaterThanZero = Object.values(extractPayload).every(
        (value) => value > 0,
      );
      if (allGreaterThanZero) {

        let extractImgData = await this.extractLassoWithTimeout(
          id,
          partCounter,
          maskUrl,
          extractPayload,
          imgFitWidth,
          imgFitHeight,
        );

        if (extractImgData.status === true) {
          //send lasso extraction to playground
          //i.e. add a member to playground upload image
          if (this.currentPenId === 0) {
            //if the chosen pen is element pen
            this.currentExtract.width = extractPayload.width;
            this.currentExtract.height = extractPayload.height;
            this.extractImgArr.push({
              idFromUpload: id,
              idFromPart: partCounter,
              imagePath:
                "assets/images/extract/extract" +
                id +
                "-" +
                partCounter +
                ".png",
              w: extractPayload.width,
              h: extractPayload.height,
              z: 1,
            });
          } else if (this.currentPenId === 1) {
            this.currentColor = extractImgData.palette[0]; //dominant color
            this.currentColorPalette = extractImgData.palette; // a color palette with 5 colors
          } else if (this.currentPenId === 3) {
            //texture pen
            this.currentExtractPath =
              "assets/images/extract/extract" + id + "-" + partCounter + ".png";
            this.brush.size = extractPayload.width;
            this.brush.gap = (extractPayload.width / 9).toFixed(1); //default gap set to a reasonable gap based on texture size input
            this.brush.whRatio = extractPayload.width / extractPayload.height;
            // Check if the URL already has a timestamp parameter
            const timestampRegex = /\?(timeStamp)=\d*/;

            if (timestampRegex.test(this.currentExtractPath)) {
              // Replace the existing timestamp if present
              this.currentExtractPath = this.currentExtractPath.replace(
                /\?(timeStamp)=\d*/,
                "?timeStamp=" + new Date().getTime(),
              );
            } else {
              this.currentExtractPath += "?timeStamp=" + new Date().getTime();
            }
            document.getElementById("fakeElement").click();
          }
        } else {
          alert("Sorry, your extraction is not correctly captured!");
        }
      }
    },

    extractWholeImage(id) {
      if (this.currentPenId === 0) {
        const bgCanvas = document.getElementById("bgCanvas");
        const width = bgCanvas.width;
        const height = bgCanvas.height;
        let context = bgCanvas.getContext("2d");
        var background = new Image();
        background.src = this.imageObjectList[id].url;
        background.onload = function () {
          context.clearRect(0, 0, width, height);
          var hRatio = width / background.width;
          var vRatio = height / background.height;
          var ratio = Math.max(hRatio, vRatio);
          var centerShift_x = (width - background.width * ratio) / 2;
          var centerShift_y = (height - background.height * ratio) / 2;
          context.clearRect(0, 0, width, height);
          context.drawImage(
            background,
            0,
            0,
            background.width,
            background.height,
            centerShift_x,
            centerShift_y,
            background.width * ratio,
            background.height * ratio,
          );
        };
      }
    },
    setCurrentColor(index) {
      this.colorSource = 1;
      this.currentColor = this.currentColorPalette[index];
      function rgbToHex(r, g, b) {
        // Ensure that RGB values are within the valid range (0 to 255)
        const toHex = (value) => {
          const hex = value.toString(16); // Convert value to a hexadecimal string
          return hex.length === 1 ? "0" + hex : hex; // Add leading zero if needed
        };

        return "#" + toHex(r) + toHex(g) + toHex(b);
      }
      this.brush.color = rgbToHex(
        this.currentColor[0],
        this.currentColor[1],
        this.currentColor[2],
      );
    },
    setPenStatus(currentPenId) {
      this.currentPenId = currentPenId; //0: element pen; 1: color pen; 2:basic pen; 3: texture pen
    },

    getPenName() {
      let penName;
      switch (this.currentPenId) {
        case 0:
          penName = "Smart Object";
          break;
        case 1:
          penName = "Smart Color";
          break;
        case 2:
          penName = "Basic Pen";
          break;
        case 3:
          penName = "Smart Texture";
          break;
        default:
          penName = "Unknown";
          break;
      }
      return penName;
    },

    async submitFile() {
      const formData = new FormData();
      const fileLength = this.files.length;
      for (let i = 0; i < fileLength; i++) {
        formData.append(
          "file",
          this.files[i],
          `${this.uploadImageCounter}.png`,
        );
        this.uploadImageCounter++;
      }
      let { fileArr, dimensionArr } = await uploadFile(formData);
      console.log(fileArr, dimensionArr);
      for (let i = 0; i < fileArr.length; i++) {
        await this.addImageToCanvas(
          fileArr[i],
          "/assets/images/uploaded/" + fileArr[i],
          dimensionArr[i],
        );
      }
    },

    switchSeed() {
      this.seedCount++;
    },

    deleteCurrentExtraction() {
      this.currentSelectionId = null;
      const deleteId = this.currentExtract.id;
      const element = document.getElementById("dragResize" + deleteId);
      element.style.display = "none"; // hide the element from dom
    },

    async updateExtractImg(newImgUrl, iDExtractArr) {
      const currentImgEle = this.extractImgArr[iDExtractArr];
      const extractImagePath =
        "public/assets/images/extract/extract" +
        currentImgEle.idFromUpload +
        "-" +
        currentImgEle.idFromPart +
        ".png";
      await this.saveImgFileWithTimeOut(newImgUrl, extractImagePath, 8000); // 8-second timeout

      if (this.bgRemPromise.data.success) {
        this.bgRemPromise.isLoading = false;
        return this.bgRemPromise.data.success;
      } else return false;
    },

    async saveImgFileWithTimeOut(newImgUrl, extractImagePath, timeout) {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Operation timed out")); // Reject if timeout is reached
        }, timeout);
      });

      // Your async operation (e.g., saving the image file)
      const asyncOperation = saveImgFile(newImgUrl, extractImagePath);

      try {
        // Use Promise.race to either get the async result or timeout
        this.bgRemPromise.data = await Promise.race([
          asyncOperation,
          timeoutPromise,
        ]);
        console.log(
          "Operation completed successfully:",
          this.bgRemPromise.data,
        );
      } catch (error) {
        // Handle timeout or other errors
        console.error("Error:", error.message);
        if (error.message === "Operation timed out") {
          // Handle the timeout scenario here
          console.log("The operation took too long and was canceled.");
        }
      }
    },

    async saveGeneration() {
      const gen64Url = this.generatedBase64Url;
      if (gen64Url !== "" && gen64Url !== null) {
        this.galleryImgArr.push({ path: gen64Url });
      }
    },

    updateFilePath() {
      const iDExtractArr = this.currentExtract.id;
      const currentImgEle = this.extractImgArr[iDExtractArr];
      const currentUrl = currentImgEle.imagePath;

      // Check if the URL already has a timestamp parameter
      const timestampRegex = /\?(timeStamp)=\d*/;

      if (timestampRegex.test(currentUrl)) {
        // Replace the existing timestamp if present
        currentImgEle.imagePath = currentUrl.replace(
          /\?(timeStamp)=\d*/,
          "?timeStamp=" + new Date().getTime(),
        );
      } else {
        currentImgEle.imagePath += "?timeStamp=" + new Date().getTime();
      }
    },

    setCurrentSelection(index) {
      this.currentSelectionId = index;
    },

    moveFront() {
      this.extractImgArr[this.currentSelectionId].z++;
      const highEleZ = this.extractImgArr[this.currentSelectionId].z;
      return highEleZ;
    },

    moveBack() {
      let z = this.extractImgArr[this.currentSelectionId].z;
      if (z > 0) {
        this.extractImgArr[this.currentSelectionId].z--;
      } else this.extractImgArr[this.currentSelectionId].z = 0;
    },


    async generateLocalMask(greyMaskBase64) {
      // Perform some asynchronous operation
      // Simulate async operation with setTimeout
      try {
        // Simulate mask creation
        this.maskBase64 = await createLocalMask(greyMaskBase64);
        console.log(this.maskBase64);
        return this.maskBase64.length !== 0;
      } catch (error) {
        console.log(error);
        return false;
      }
    },

    getMaskVar(param) {
      let result;

      switch (param) {
        case 0:
          result = this.maskBase64;
          break;
        case 1:
          result = this.combinedMaskBase64; //before: colorMaskBase64
          break;
        default:
          result = "Invalid parameter";
      }

      return result;
    },

/**
 * @description Default parameters for the Image-First Generation pipeline.
 * @warning These values are based on legacy model/ControlNet configurations.
 * They should be tuned to match the requirements of your specific Generative AI
 * model to ensure optimal output quality.
 * @see {@link https://stable-diffusion-art.com/controlnet/ Useful ControlNet guide}
 */
    async imageFirstGenerate(
      userPrompt,
      canvasWithNoMaskUrl,
      withColorTexture,
      withTexture,
      withColor,
      maskVarId,
    ) {
      console.log("canvasWithNoMaskUrl");
      console.log(canvasWithNoMaskUrl);
      console.log("withColorTexture");
      console.log(withColorTexture);
      console.log("withTexture");
      console.log(withTexture);
      console.log("withColor");
      console.log(withColor);

      let payload = {
        init_images: [withColor],
        include_init_images: true,
        prompt: userPrompt,
        restore_faces: true,
        seed: this.seedCount,
        denoising_strength: 0.46,
        width: this.genImgResolution,
        height: this.genImgResolution,
        inpaint_full_res_padding: 5,
        inpainting_fill: 1, //0:'fill', 1:'original', which keeps overall original, is useful for things like faces,
        // 2: 'latent noise': generate based on prompt mainly, 3: 'latent nothing'
        inpainting_mask_invert: 0, //0 for only change the masked area, 1 for change the unmasked area
        sampler_name: "DPM++ 2M",
        negative_prompt:
          "lowers, bad anatomy, bad hands, cropped, worst quality",
        batch_size: 1,
        steps: 30,
        cfg_scale: 12,
        alwayson_scripts: {
          controlnet: {
            args: [
              {
                enabled: true,
                image: withColor,
                guidance_end: 0.4,
                weight: 0.55,
                pixel_perfect: true,
                module: "tile_resample",
                model: "control_v11f1e_sd15_tile [a371b31b]",
                processor_res: 1024,
                control_mode: "Balanced",
              },
              {
                enabled: true,
                image: withTexture,
                guidance_end: 0.5,
                weight: 0.9,
                threshold_a: 68,
                threshold_b: 190,
                module: "canny",
                model: "control_v11p_sd15_canny [d14c016b]",
                processor_res: this.genImgResolution,
                control_mode: "Balanced",
                pixel_perfect: true,
              },
              {
                enabled: true,
                image: withTexture,
                weight: 1,
                module: "softedge_anyline",
                model: "control_v11p_sd15_softedge [a8575a2a]",
                pixel_perfect: true,
                processor_res: this.genImgResolution,
                control_mode: "Balanced",
              },
            ],
          },
        },
      };
      if (maskVarId === 0) {
        //generate using user masked areas
        payload.mask_blur = 10;
        payload.mask = this.getMaskVar(maskVarId);
        payload.inpaint_full_res = 1; //0: whole picture, 1:only masked
      } else if (maskVarId === 1) {
        //generate using the whole canvas
        payload.inpaint_full_res = 0; //0: whole picture, 1:only masked
      }
      await generateI2I(payload).then((data) => {
        console.log(data);
        this.generatedBase64Url = data;
        this.generationPromise.isLoading = false;
      });
    },

/**
 * @description Default parameters for the Text-First Generation pipeline.
 * @warning These values are based on legacy model/ControlNet configurations.
 * They should be tuned to match the requirements of your specific Generative AI
 * model to ensure optimal output quality.
 * @see {@link https://stable-diffusion-art.com/controlnet/ Useful ControlNet guide}
 */
    async textFirstGenerate(
      userPrompt,
      withColorTexture,
      withTexture,
      withColor,
      maskVarId,
    ) {
      console.log("withColorTexture");
      console.log(withColorTexture);
      console.log("withTexture");
      console.log(withTexture);
      console.log("withColor");
      console.log(withColor);
      let payload = {
        prompt: userPrompt,
        seed: this.seedCount,
        width: this.genImgResolution,
        height: this.genImgResolution,
        restore_faces: true,
        sampler_name: "DPM++ 2M SDE",
        negative_prompt:
          "lowers, bad anatomy, bad hands, cropped, worst quality",
        batch_size: 1,
        steps: 20,
        cfg_scale: 16,
        alwayson_scripts: {
          controlnet: {
            args: [
              {
                enabled: true,
                image: withTexture,
                module: "canny",
                model: "control_v11p_sd15_canny [d14c016b]",
                processor_res: this.genImgResolution,
                control_mode: "My prompt is more important", //1:prompt is more important
              },
              {
                enabled: true,
                image: withColor,
                weight: 1,
                guidance_end: 0.4,
                module: "tile_resample",
                model: "control_v11f1e_sd15_tile [a371b31b]",
                pixel_perfect: true,
                processor_res: this.genImgResolution,
                control_mode: "My prompt is more important", //1:prompt is more important
              },
            ],
          },
        },
      };

      await generateT2I(payload).then((data) => {
        console.log(data);
        this.generatedBase64Url = data;
        this.generationPromise.isLoading = false;
      });
    },

    async doSearch(params) {
      this.searchPromiseState.loading = true;

      try {
        if (!params) {
          alert("Type in search box to search");
        } else {
          this.searchPromiseState.data = await this.asyncCallWithTimeout(
            searchUnsplash(params),
            10000,
          );
          this.addAllImageInfo(this.searchPromiseState.data);
        }
      } catch (error) {
        this.searchPromiseState.error =
          "Invalid search, try another search word. Error Message: " +
          error.message;
      } finally {
        this.searchPromiseState.loading = false;
      }
    },

    addAllImageInfo(sourceArray) {
      this.searchImgList = [];
      let elementsToAdd = Math.min(this.numSearchResult, sourceArray.length);
      let elements = sourceArray.slice(0, elementsToAdd);
      this.searchImgList = this.searchImgList.concat(elements);
    },

    async asyncCallWithTimeout(asyncPromise, timeLimit) {
      let timeoutHandle;

      const timeoutPromise = new Promise((_resolve, reject) => {
        timeoutHandle = setTimeout(
          () => reject(new Error("Async call timeout limit reached")),
          timeLimit,
        );
      });

      return Promise.race([asyncPromise, timeoutPromise]).then((result) => {
        clearTimeout(timeoutHandle);
        return result;
      });
    },
  },
});
