<template>
  <div
    v-show="canvasStore.showImgEditModal"
    class="position-fixed imgEditModal border border-2 rounded"
    @contextmenu.prevent=""
  >
    <h5 class="m-1">Extraction Editor</h5>
    <p class="m-1">Brush to Erase</p>
    <div class="row">
      <div class="col-8">
        <canvas
          v-show="!canvasStore.bgRemPromise.isLoading"
          class="mx-auto"
          id="tempCanvas"
        ></canvas>
        <img
          v-show="canvasStore.bgRemPromise.isLoading"
          src="/assets/images/spinner.gif"
          style="width: 100px; height: 100px"
          alt="spinner image"
        />
      </div>
      <div class="col-4">
        <label class="card-subtitle" for="drawing-line-width"
          >Brush Size: {{ canvasStore.brush.size }}</label
        >
        <br /><input
          type="range"
          v-model="canvasStore.brush.size"
          min="0"
          max="100"
          id="drawing-line-width"
        /><br />
        <button
          id="autoRemBg"
          class="btn btn-dark btn-success m-1"
          @click="remBg"
        >
          Auto Remove Background
        </button>
        <button @click="revertToOri" class="btn btn-dark m-1">
          Revert Changes
        </button>

        <button @click="deleteExtraction" class="btn btn-danger m-1">
          Delete It
        </button>
        <button @click="closeModal" class="btn btn-success m-1">
          Save and Close
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted } from "vue";
import { useCanvas } from "@/stores/canvasStore";
import { removeBgNode } from "@/apis/bgRemove";

export default {
  name: "imgEdit",
  setup() {
    const canvasStore = useCanvas();
    let pointsArr = [];
    let isLoading = canvasStore.bgRemPromise.isLoading;
    const maskTransparency = 0.7;
    let EPenButton = {
      tip: 0x1, // left mouse, touch contact, pen contact
      barrel: 0x2, // right mouse, pen barrel button
      middle: 0x4, // middle mouse
      eraser: 0x20, // pen eraser button
    };
    let inStroke = false;
    //let processMode = canvasStore.processMode; //0: manual erase 1: auto erase
    let posLast = { x: 0, y: 0 };
    let isDrawing = false;
    let brush = canvasStore.brush;
    brush.color = "#ffffff";

    onMounted(() => {
      let canvas = document.getElementById("tempCanvas");
      let context = canvas.getContext("2d", {
        willReadFrequently: true,
      });
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
        canvas.style.cursor = `url('${svgDataURL}') ${brushSize / 2} ${brushSize / 2}, auto`;
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
        let canvasRect = canvas.getBoundingClientRect();

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
            // A pen was used

            // use brush
            context.lineWidth = brush.size * pressure;
            if (canvasStore.colorSource === 0) {
              //0:self defined; 1:from extracted palette
              context.strokeStyle = brush.color;
            } else if (canvasStore.colorSource === 1) {
              context.strokeStyle = "rgb(" + canvasStore.currentColor + ")";
            }
          }

          switch (evt.type) {
            case "pointerdown":
              isDrawing = true;
              posLast = pos;

              break;
            case "pointerup":
              isDrawing = false;
              pointsArr = [];
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

              if (pressure > 0) {
                canvasStore.processMode = 0;
                if (
                  buttons === EPenButton.eraser ||
                  canvasStore.eraser.status === true
                ) {
                  context.globalCompositeOperation = "destination-out"; //erase
                } else if (canvasStore.eraser.status === false) {
                  context.globalCompositeOperation = "destination-out"; // brush
                }
                context.beginPath();
                context.lineCap = "round";
                context.moveTo(posLast.x, posLast.y);

                // Draws Bezier curve from context position to midPoint.
                var midPoint = midPointBetween(posLast, pos);
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
        canvas.addEventListener(pointerEvents[idx], pointerEventDraw, false);
      }
    });
    return {
      isLoading,
      canvasStore,
      maskTransparency,
      pointsArr,
      EPenButton,
      inStroke,
      posLast,
      isDrawing,
    };
  },
  methods: {
    revertToOri() {
      let canvas = document.getElementById("tempCanvas");
      let context = canvas.getContext("2d");
      var background = new Image();
      background.src = this.canvasStore.currentExtract.path;
      background.onload = function () {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(background, 0, 0);
      };
    },

    remBg() {
      this.canvasStore.bgRemPromise.isLoading = true;
      this.canvasStore.processMode = 1;
      removeBgNode("public/" + this.canvasStore.currentExtract.path).then(
        (response) => {
          if (response) {
            this.canvasStore.bgRemPromise.isLoading = false;
            let canvas = document.getElementById("tempCanvas");
            let context = canvas.getContext("2d", {
              willReadFrequently: true,
            });
            var background = new Image();
            context.clearRect(0, 0, canvas.width, canvas.height);
            background.src = this.canvasStore.currentExtract.path.replace(
              "/extract/",
              "/bgrem/",
            );

            background.onload = function () {
              context.drawImage(background, 0, 0);
            };
          }
        },
      );
    },
    closeModal() {
      const canvasDrawing = document.getElementById("tempCanvas");
      const dataURL = canvasDrawing.toDataURL();

      new Promise((resolve, _) => {
        const response = this.canvasStore.updateExtractImg(
          dataURL,
          this.canvasStore.currentExtract.id,
        );
        resolve(response);
      }).then((response) => {
        this.canvasStore.updateFilePath();
        this.canvasStore.showImgEditModal = false;
      });
    },

    deleteExtraction() {
      this.canvasStore.showImgEditModal = false;
      this.canvasStore.deleteCurrentExtraction();
    },
  },
};
</script>

<style scoped>
#tempCanvas {
  touch-action: none; /*prevent canvas scrolling and system touch behavior*/
}
.imgEditModal {
  z-index: 5000;
  max-width: 40%;
  height: auto;
  top: 3%;
  left: 20%;
  position: relative;
  background: #f6f2e9;
}
</style>
