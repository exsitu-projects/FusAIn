<template>
  <div
    id="playground"
    onresize="setCanvasProps()"
    style="overflow-y: scroll; max-height: 100vh"
  >
    <imgEdit @contextmenu.prevent="" />

    <div class="row">
      <div class="col-6">
        <div class="input-group m-1 row">
          <input
            v-model="this.userPrompt"
            type="text"
            class="form-control"
            placeholder="Enter your text prompt here..."
          />
        </div>
        <div class="row justify-content-end">
          <button class="col-auto btn btn-light m-1" @click="selectionToFront">
            Forward
          </button>
          <button class="col-auto btn btn-light m-1" @click="selectionToBack">
            Backward
          </button>
          <button
            id="clearBtn"
            class="col-auto btn btn-light m-1"
            @click="clearCanvas"
          >
            Clear
          </button>
          <button
            class="col-auto btn btn-light m-1"
            data-bs-toggle="button"
            @click="selectLocalAI()"
          >
            <img class="pen-image" src="/assets/images/pen/smart_area.png" />
            {{ localBtnDisplay }}
          </button>
        </div>
        <div class="row">
          <div class="col-2">
            <input
              type="radio"
              class="btn-check"
              name="buttons"
              id="btn0"
              autocomplete="off"
              checked
            />
            <label class="btn btn-light m-1" for="btn0" @click="chooseElePen"
              ><img class="pen-image" src="/assets/images/pen/pen_ele.png"
            /></label>

            <input
              type="radio"
              class="btn-check"
              name="buttons"
              id="btn1"
              autocomplete="off"
            />
            <label class="btn btn-light m-1" for="btn1" @click="chooseColorPen"
              ><img class="pen-image" src="/assets/images/pen/pen_color.png"
            /></label>

            <input
              type="radio"
              class="btn-check"
              name="buttons"
              id="btn2"
              autocomplete="off"
            />
            <label class="btn btn-light m-1" for="btn2" @click="chooseBasicPen"
              ><img class="pen-image" src="/assets/images/pen/pen_basic.png"
            /></label>

            <input
              type="radio"
              class="btn-check"
              name="buttons"
              id="btn3"
              autocomplete="off"
            />
            <label
              class="btn btn-light m-1"
              style="z-index: 9000"
              for="btn3"
              @click="chooseTexturePen"
              ><img class="pen-image" src="/assets/images/pen/pen_texture.png"
            /></label>

            <button
              data-bs-toggle="button"
              :class="'btn btn-light m-1'"
              id="basicEraser"
              @click="eraseBasic"
            >
              <img class="pen-image" src="/assets/images/eraser/eraser.png" />
            </button>
          </div>
          <div class="col-10">
            <div
              id="canvasDiv"
              :style="{
                width: mainCanvasSize + 'px',
                height: mainCanvasSize + 'px',
              }"
            >
              <canvas
                id="mainCanvas"
                :height="mainCanvasSize"
                :width="mainCanvasSize"
                @contextmenu.prevent=""
              ></canvas>

              <textureCanvas :mainCanvasSize="mainCanvasSize"></textureCanvas>
              <maskCanvas
                :mainCanvasSize="mainCanvasSize"
                @contextmenu.prevent=""
                id="localMaskCanvas"
                class="nonTexture nonColor"
              ></maskCanvas>
              <colorCanvas
                :mainCanvasSize="mainCanvasSize"
                @contextmenu.prevent=""
                id="colorCanvas"
                class="nonTexture"
              ></colorCanvas>
              <div class="inner">
                <VueDragResize
                  v-for="(ele, index) of canvasStore.extractImgArr"
                  :key="index"
                  :style="
                    'background: no-repeat center/100% url(' +
                    ele.imagePath +
                    ')'
                  "
                  :x="100"
                  :y="0"
                  :w="ele.w"
                  :h="ele.h"
                  :parentLimitation="true"
                  :isActive="false"
                  :z="ele.z"
                  @contextmenu.prevent=""
                  @pointerdown="tipTouchBtnClickCanv($event, index)"
                  v-on:resizing="resize"
                  v-on:dragging="resize"
                  :id="'dragResize' + index"
                  class="dragResize"
                />
                <canvas
                  id="bgCanvas"
                  :height="mainCanvasSize"
                  :width="mainCanvasSize"
                  @contextmenu.prevent=""
                  style="z-index: 0"
                ></canvas>
              </div>
            </div>
          </div>
        </div>

        <brushScope @contextmenu.prevent />
      </div>
      <div class="col-1 middle-buttons">
        <button
          class="btn btn-light m-1"
          @click="generateImg"
          style="left: -15px; position: relative"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-right"></font-awesome-icon
          >Guided Generate
        </button>
        <button
          class="btn btn-light m-1"
          @click="mergeImg"
          style="left: -15px; position: relative"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-right"></font-awesome-icon
          >Merge
        </button>
        <button
          class="btn btn-light m-1"
          style="right: -35px; position: relative"
          @click="transmitGeneration"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left"></font-awesome-icon>
          Use Image
        </button>
      </div>
      <div class="col-5" style="top: 60px; position: relative">
        <ul class="nav nav-tabs">
          <li class="nav-item">
            <button
              :class="'nav-link ' + styleLockActive"
              :aria-disabled="styleLock"
              @click="toggleStyleLock"
            >
              Style Lock
              <font-awesome-icon
                v-show="styleLock"
                icon="fa-solid fa-check"
              ></font-awesome-icon>
            </button>
          </li>
        </ul>
        <div
          class="genDiv"
          :style="{
            width: mainCanvasSize + 'px',
            height: mainCanvasSize + 'px',
          }"
        >
          <img
            v-show="canvasStore.generationPromise.isLoading"
            src="/assets/images/spinner.gif"
            class="spinner m-auto"
            alt="spinner image"
          />
          <img
            v-show="
              this.canvasStore.generatedBase64Url !== null &&
              !canvasStore.generationPromise.isLoading
            "
            :src="this.canvasStore.generatedBase64Url"
            :width="this.mainCanvasSize"
            :height="this.mainCanvasSize"
            alt="generated image"
          />
        </div>
        <b>Gallery</b>
        <genGallery />
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted } from "vue";
import VueDragResize from "vue-drag-resize";
import html2canvas from "html2canvas";
import { useCanvas } from "@/stores/canvasStore";

import MaskCanvas from "@/components/maskCanvas.vue";
import ColorCanvas from "@/components/colorCanvas.vue";
import { CannyJS } from "@/js/canny";
import TextureCanvas from "@/components/textureCanvas.vue";
import imgEdit from "@/components/imgEdit.vue";
import genGallery from "@/components/genGallery.vue";
import BrushScope from "@/components/brushScope.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
export default {
  name: "CanvasView",
  components: {
    FontAwesomeIcon,
    BrushScope,
    genGallery,
    imgEdit,
    TextureCanvas,
    ColorCanvas,
    MaskCanvas,
    VueDragResize,
    CannyJS,
  },
  setup() {
    const exportedCanvasSize = 528; //bug?? the exported image reso is 875
    const cannyHt = 100; //canny edge high threshold
    const cannyLt = 40; //canny edge low threshold
    let maskFlag = false;
    const mainCanvasBgColor = "transparent"; // in order to show the element layer when using basic pen
    const canvasStore = useCanvas();
    let inStroke = false;
    let posLast = { x: 0, y: 0 };
    let isDrawing = false;
    let highestZIndex = 0;
    const mainCanvasSize = 470;
    let pointsArr = [];
    let EPenButton = {
      tip: 0x1, // left mouse, touch contact, pen contact
      barrel: 0x2, // right mouse, pen barrel button
      middle: 0x4, // middle mouse
      eraser: 0x20, // pen eraser button
    };
    let brush = canvasStore.brush;
    onMounted(() => {
      let mainCanvas = document.getElementById("mainCanvas");
      let context = mainCanvas.getContext("2d", { willReadFrequently: true });
      context.fillStyle = mainCanvasBgColor;
      context.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

      const pointerEvents = [
        "pointerdown",
        "pointerup",
        "pointercancel",
        "pointermove",
        "pointerover",
        "pointerout",
        "pointerenter",
        "pointerleave",
        "gotpointercapture",
        "lostpointercapture",
      ];
      function generateSVGCursor(brushSize, brushColor) {
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${brushSize}" height="${brushSize}" viewBox="0 0 ${brushSize} ${brushSize}">
            <circle cx="${brushSize / 2}" cy="${brushSize / 2}" r="${brushSize / 2}" fill="${brushColor}" />
        </svg>
    `;
        // Encode the SVG as a data URL
        return `data:image/svg+xml;base64,${btoa(svg)}`;
      }

      // Function to update the cursor
      function updateCursor(brushSize, brushColor) {
        const svgDataURL = generateSVGCursor(brushSize, brushColor);
        mainCanvas.style.cursor = `url('${svgDataURL}') ${brushSize / 2} ${brushSize / 2}, auto`;
      }
      /////////////////////////////////////////////////////////////////////////
      // Find point between two other points.
      //
      function midPointBetween(p1, p2) {
        return {
          x: p1.x + (p2.x - p1.x) / 2,
          y: p1.y + (p2.y - p1.y) / 2,
        };
      }

      /////////////////////////////////////////////////////////////////////////
      // Handle drawing for HTML5 Pointer Events.
      //
      function pointerEventDraw(evt) {
        let canvasRect = mainCanvas.getBoundingClientRect();
        let screenPos = {
          x: evt.clientX,
          y: evt.clientY,
        };

        let pos = {
          x: screenPos.x - canvasRect.left,
          y: screenPos.y - canvasRect.top,
        };

        let pressure = evt.pressure;
        let buttons = evt.buttons;
        //var tilt = { x: evt.tiltX, y: evt.tiltY };
        //var rotate = evt.twist;

        if (evt.pointerType) {
          if (evt.pointerType === "pen" || evt.pointerType === "mouse") {
            // use brush
            context.strokeStyle = brush.color;
            context.lineWidth = Math.max(
              brush.size * 0.5,
              brush.size * pressure,
            );
          }

          // If pen erase button is being used, then erase!

          switch (evt.type) {
            case "pointerdown":
              isDrawing = true;
              posLast = pos;
              break;
            case "pointerup":
              isDrawing = false;
              break;
            case "lostpointercapture":
              break;
            case "pointermove":
              if (!isDrawing) {
                return;
              }
              updateCursor(
                Math.max(brush.size * 0.5, brush.size * pressure),
                brush.color,
              );
              if (pressure > 0 && canvasStore.currentPenId === 2) {
                if (
                  buttons === EPenButton.eraser ||
                  canvasStore.eraser.status === true
                ) {
                  context.globalCompositeOperation = "destination-out"; //erase
                } else if (canvasStore.eraser.status === false) {
                  context.globalCompositeOperation = "source-over"; // brush
                }
                context.beginPath();
                context.lineCap = "round";
                context.moveTo(posLast.x, posLast.y);

                // Draws Bezier curve from context position to midPoint.
                const midPoint = midPointBetween(posLast, pos);
                context.quadraticCurveTo(
                  posLast.x,
                  posLast.y,
                  midPoint.x,
                  midPoint.y,
                );

                // This lineTo call eliminates gaps (but leaves flat lines if stroke
                // is fast enough).
                context.lineTo(pos.x, pos.y);
                context.stroke();
              }
              pointsArr.push(pos);
              posLast = pos;
              break;

            case "pointerenter":
              updateCursor(
                Math.max(brush.size * 0.5, brush.size * pressure),
                brush.color,
              );
              break;

            case "pointerleave":
              document.body.style.cursor = "default";
              break;

            default:
              //console.log("WARNING: unhandled event: " + evt.type);
              break;
          }
        }
      }

      for (let idx = 0; idx < pointerEvents.length; idx++) {
        mainCanvas.addEventListener(
          pointerEvents[idx],
          pointerEventDraw,
          false,
        );
      }
    });
    return {
      brush,
      cannyHt,
      cannyLt,
      exportedCanvasSize,
      maskFlag,
      highestZIndex,
      mainCanvasSize,
      inStroke,
      posLast,
      isDrawing,
      pointsArr,
      EPenButton,
      canvasStore,
    };
  },

  data() {
    return {
      styleLock: false, //default style lock on
      styleLockActive: "",
      width: 50, //this is important non-zero for some reasons..
      height: 50,
      top: 0,
      left: 0,
      localBtnDisplay: "Select Gen Area",
      userPrompt: "",
    };
  },

  methods: {
    chooseElePen() {
      this.canvasStore.eraser.status = false;
      const canvas = document.getElementById("mainCanvas");
      canvas.style.zIndex = "0";
      this.highestZIndex += 1;
      this.canvasStore.setPenStatus(0);
      for (let ele of this.canvasStore.extractImgArr) {
        ele.z = this.highestZIndex;
      }
    },
    chooseColorPen() {
      const colorCanvas = document.getElementById("colorCanvas");
      this.highestZIndex += 1;
      colorCanvas.style.zIndex = this.highestZIndex.toString();
      this.canvasStore.eraser.status = false;
      const element = document.getElementById("basicEraser");
      element.classList.remove("active");
      this.canvasStore.setPenStatus(1);
    },
    chooseTexturePen() {
      const textureCanvas = document.getElementById("textureCanvas");
      this.highestZIndex += 1;
      textureCanvas.style.zIndex = this.highestZIndex.toString();
      this.canvasStore.eraser.status = false;
      const element = document.getElementById("basicEraser");
      element.classList.remove("active");
      this.canvasStore.setPenStatus(3);
    },
    chooseBasicPen() {
      this.canvasStore.eraser.status = false;
      const element = document.getElementById("basicEraser");
      element.classList.remove("active");
      this.canvasStore.setPenStatus(2);
      this.highestZIndex++;
      const canvas = document.getElementById("mainCanvas");
      canvas.style.zIndex = this.highestZIndex.toString();
      // const overlaydiv = document.getElementById("overlay-div");
      // overlaydiv.style.zIndex = "-1";
    },
    tipTouchBtnClickCanv(evt, index) {
      let buttons = evt.buttons;
      if (buttons === this.EPenButton.barrel) {
        //user right clicked on a certain image
        this.canvasStore.currentExtract.path =
          this.canvasStore.extractImgArr[index].imagePath;
        this.canvasStore.currentExtract.id = index;

        this.canvasStore.showImgEditModal = true;
        let canvas = document.getElementById("tempCanvas");
        let context = canvas.getContext("2d", {
          willReadFrequently: true,
        });
        var background = new Image();
        canvas.width = this.canvasStore.currentExtract.width * 2;
        canvas.height = this.canvasStore.currentExtract.height * 1.2;
        context.clearRect(0, 0, canvas.width, canvas.height);
        background.src = this.canvasStore.currentExtract.path;

        background.onload = function () {
          context.drawImage(background, 0, 0);
        };
      }
      this.canvasStore.setCurrentSelection(index);
    },

    resize(newRect) {
      this.width = newRect.width;
      this.height = newRect.height;
      this.top = newRect.top;
      this.left = newRect.left;
      this.canvasStore.currentExtract.width = newRect.width;
      this.canvasStore.currentExtract.height = newRect.height;
      this.canvasStore.setPenStatus(0); //element pen
    },

    eraseBasic() {
      const element = document.getElementById("basicEraser");
      if (this.canvasStore.eraser.status === false) {
        element.classList.add("active");
        this.canvasStore.eraser.status = true;
      } else {
        element.classList.remove("active");
        this.canvasStore.eraser.status = false;
      }
    },
    selectLocalAI() {
      const inputs = document.getElementsByTagName("input");
      for (let ele of inputs) {
        ele.checked = false;
      }

      const canvas = document.getElementById("mainCanvas");
      const dragResizeEles = document.querySelectorAll(".dragResize");
      const localMaskCanvas = document.getElementById("localMaskCanvas");
      if (this.maskFlag === true) {
        this.maskFlag = false;
        this.localBtnDisplay = "Select Gen Area";
        localMaskCanvas.style.zIndex = -1;
        canvas.style.zIndex = this.highestZIndex.toString();
        this.highestZIndex += 1;
        dragResizeEles.forEach((element) => {
          element.style.zIndex = this.highestZIndex.toString(); // Set the desired z-index value
        });
      } else {
        //to define local AI applying area
        this.localBtnDisplay = "Back to Main";
        this.maskFlag = true;
        this.highestZIndex += 1;
        localMaskCanvas.style.zIndex = this.highestZIndex.toString();
        this.canvasStore.setPenStatus(2); //avoid the texture pen, will need to change later
      }
    },

    toggleStyleLock() {
      if (this.styleLock) {
        //turning off style lock
        this.styleLock = false;
        this.styleLockActive = "";
      } else {
        this.styleLock = true;
        this.styleLockActive = "active";
      }
    },

    clearCanvas() {
      let canvasLists = document.getElementsByTagName("canvas");
      for (let eachCanvas of canvasLists) {
        let context = eachCanvas.getContext("2d", { willReadFrequently: true });
        context.clearRect(0, 0, eachCanvas.width, eachCanvas.height);
      }
      this.canvasStore.extractImgArr = [];
    },

    setCanvasProps() {
      this.clearCanvas(); // ensures background saved with drawn image
    },

    callCanny() {
      let imageData;
      let randCanv = document.createElement("canvas");
      let textureCanvas = document.getElementById("textureCanvas");
      html2canvas(textureCanvas, {
        //extract ori + color + texture
        useCORS: true,
        //ignoreElements: (ele) => ele.id === "textureCanvas",
      })
        .then((canvas) => {
          imageData = CannyJS.canny(canvas, this.cannyHt, this.cannyLt);
          return imageData;
        })
        .then((imageData) => {
          randCanv.width = this.exportedCanvasSize;
          randCanv.height = this.exportedCanvasSize;
          imageData.drawOn(randCanv);
          this.canvasStore.textureMaskPath = randCanv.toDataURL("image/png");
        });

      // overwrites the original canvas
    },

    selectionToFront() {
      const highEleZ = this.canvasStore.moveFront();
      if (highEleZ > this.highestZIndex) this.highestZIndex = highEleZ;
    },

    selectionToBack() {
      this.canvasStore.moveBack();
    },

    generateImg() {
      if (this.styleLock) {
        //generate using the same seed
        this.canvasScreenshot(this.canvasStore.imageFirstGenerate);
      } else {
        //change to another seed
        this.canvasStore.switchSeed();
        this.canvasScreenshot(this.canvasStore.imageFirstGenerate);
      }
    },

    mergeImg() {
      if (this.userPrompt.length === 0) {
        alert("You need to enter prompts to guide merging!");
      } else {
        if (this.styleLock) {
          //generate using the same seed
          this.canvasScreenshot(this.canvasStore.textFirstGenerate);
        } else {
          //change to another seed
          this.canvasStore.switchSeed();
          this.canvasScreenshot(this.canvasStore.textFirstGenerate);
        }
      }
    },

    transmitGeneration() {
      let mainCanvas = document.getElementById("mainCanvas");
      let ctx = mainCanvas.getContext("2d");
      const clear = this.clearCanvas;
      var background = new Image();
      background.src = this.canvasStore.generatedBase64Url;
      // Make sure the image is loaded first otherwise nothing will draw.
      background.onload = function () {
        clear();
        ctx.drawImage(background, 0, 0, mainCanvas.width, mainCanvas.height);
      };
      mainCanvas.style.zIndex = 1;
    },

    exposeCanvases() {
      const colorCanvas = document.getElementById("colorCanvas");
      const textureCanvas = document.getElementById("textureCanvas");
      colorCanvas.style.zIndex = (this.highestZIndex + 1).toString();
      textureCanvas.style.zIndex = (this.highestZIndex + 2).toString();
      this.highestZIndex = this.highestZIndex + 3;
    },

    async canvasScreenshot(functionToCall) {
      this.exposeCanvases();
      this.canvasStore.generationPromise.isLoading = true;
      const element = document.getElementById("canvasDiv");
      let canvasWithColorTextureMaskUrl;
      let canvasWithTextureMaskUrl;
      let canvasWithColorMaskUrl;
      this.callCanny();
      if (this.maskFlag === false) {
        // generate using the whole canvas
        html2canvas(element, {
          //extract ori + color + texture
          useCORS: true,
          //ignoreElements: (ele) => ele.id === "textureCanvas",
        })
          .then(async (canvasWithColorTextureMask) => {
            canvasWithColorTextureMaskUrl =
              canvasWithColorTextureMask.toDataURL("image/png");
            return await html2canvas(element, {
              //extract ori + texture
              useCORS: true,
              ignoreElements: (ele) => {
                return ele.id === "colorCanvas";
              },
            });
          })
          .then(async (canvasWithTextureMask) => {
            canvasWithTextureMaskUrl =
              canvasWithTextureMask.toDataURL("image/png");
            return await html2canvas(element, {
              //extract ori + color
              useCORS: true,
              ignoreElements: (ele) => ele.id === "textureCanvas",
            });
          })
          .then(async (canvasWithColorMask) => {
            canvasWithColorMaskUrl = canvasWithColorMask.toDataURL("image/png");
            return await html2canvas(element, {
              //extract ori
              useCORS: true,
              ignoreElements: (ele) =>
                ele.id === "colorCanvas" || ele.id === "textureCanvas",
            });
          })
          .then(async (canvasWithNoMask) => {
            const canvasWithNoMaskUrl = canvasWithNoMask.toDataURL("image/png");
            functionToCall(
              this.userPrompt,
              canvasWithNoMaskUrl,
              canvasWithColorTextureMaskUrl,
              canvasWithTextureMaskUrl,
              canvasWithColorMaskUrl,
              1, //1 means using color + texture mask
            );
          })
          .catch((error) => {
            console.error("Error capturing screenshots:", error);
          });
      } else {
        const localMaskCanvas = document.getElementById("localMaskCanvas");
        await this.canvasStore.generateLocalMask(
          localMaskCanvas.toDataURL("image/png"),
        );

        html2canvas(element, {
          //extract ori + color + texture mask
          useCORS: true,
          ignoreElements: (ele) => ele.id === "localMaskCanvas",
        })
          .then(async (canvasWithColorTextureMask) => {
            canvasWithColorTextureMaskUrl =
              canvasWithColorTextureMask.toDataURL("image/png");
            return await html2canvas(element, {
              //extract ori + texture
              useCORS: true,
              ignoreElements: (ele) => {
                if (ele.classList.contains("nonTexture")) {
                  return true;
                }
              },
            });
          })
          .then(async (canvasWithTextureMask) => {
            canvasWithTextureMaskUrl =
              canvasWithTextureMask.toDataURL("image/png");
            console.log("texture " + canvasWithTextureMaskUrl);
            return await html2canvas(element, {
              //extract ori + color
              useCORS: true,
              ignoreElements: (ele) => {
                if (ele.classList.contains("nonColor")) {
                  return true;
                }
              },
            });
          })

          .then((canvasWithColorMask) => {
            // send the whole canvas without localMask area
            canvasWithColorMaskUrl = canvasWithColorMask.toDataURL("image/png");
            console.log("color " + canvasWithColorMaskUrl);
            this.canvasStore.imageFirstGenerate(
              this.userPrompt,
              0,
              canvasWithColorTextureMaskUrl,
              canvasWithTextureMaskUrl,
              canvasWithColorMaskUrl,
              0, //0 means using local mask
            );
          })
          .catch((error) => {
            console.error("Error capturing screenshots:", error);
          });
      }
    },
  },
};
</script>

<style>
#canvasDiv {
  position: relative;
  margin-left: auto;
  margin-right: 0;
  background: white;
  right: 0;
  overflow: hidden;
}

#mainCanvas {
  position: absolute;
  border: 1px solid #d3d3d3;
  touch-action: none;
}

.pen-image {
  width: 30px;
  height: 30px;
}

#textureCanvas {
  touch-action: none; /*prevent canvas scrolling and system touch behavior*/
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 0;
}

.genDiv {
  background: white;
}

.spinner {
  width: 100px;
  height: auto;
}

.middle-buttons {
  left: -10px;
  position: relative;
  top: 100px;
}

.inner {
  width: 600px;
  height: 600px;
  margin: -60px -60px -60px -60px;
  position: relative;
}

#bgCanvas {
  touch-action: none; /*prevent canvas scrolling and system touch behavior*/
  position: absolute;

  width: 100%;
  height: 100%;
}
</style>
