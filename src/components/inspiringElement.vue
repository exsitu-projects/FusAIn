<template onresize="setCanvasProps()">
  <div
    class="cursorElement"
    style="display: inline-block; position: relative"
    @contextmenu.prevent
  >
    <canvas
      @contextmenu.prevent
      :id="'myCanvas' + id"
      class="myCanvas"
      :width="imgFitWidth"
      :height="imgFitHeight"
      :style="'background: no-repeat center/100% url(' + source + ')'"
    ></canvas>
  </div>
</template>

<script>
import { onMounted } from "vue";
import { useCanvas } from "@/stores/canvasStore";
export default {
  props: { source: String, id: Number, w: Number, h: Number },
  name: "InspiringElement",
  setup(props) {
    const canvasStore = useCanvas();
    const maskTransparency = 0.7;
    const uploadEleSize = 300;
    const imageId = props.id;
    let inStroke = false;
    let posLast = { x: 0, y: 0 };
    let isDrawing = false;
    let pointsArr = [];
    let extractPayload = { left: 0, top: 0, width: 0, height: 0 };
    let EPenButton = {
      tip: 0x1, // left mouse, touch contact, pen contact
      barrel: 0x2, // right mouse, pen barrel button
      middle: 0x4, // middle mouse
      eraser: 0x20, // pen eraser button
    };

    const imgFitWidth = props.w;
    const imgFitHeight = props.h;
    onMounted(() => {
      let myCanvas = document.getElementById("myCanvas" + imageId);
      let context = myCanvas.getContext("2d");

      function updateExtractToCanvas() {
        const maskUrl = document
          .getElementById("myCanvas" + imageId)
          .toDataURL();
        getPathBoundingBox(context);

        canvasStore.updateExtractToCanvas(
          imageId,
          maskUrl,
          extractPayload,
          imgFitWidth,
          imgFitHeight,
        );
      }

      function extractWholeImage() {
        canvasStore.extractWholeImage(imageId);
      }

      /////////////////////////////////////////////////////////////////////////
      // Upon a window load event, registers all events.
      //

      // These events are for browsers that handle
      // HTML5 PointerEvent events.
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
      let lastClickTime = 0;
      const doubleClickThreshold = 250; // Time in milliseconds

      /////////////////////////////////////////////////////////////////////////
      // NO Handle event rendering and reporting to output
      // for traditional mouse/touch/pen handling.
      //

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
        let canvasRect = myCanvas.getBoundingClientRect();
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
          switch (evt.pointerType) {
            case "touch":
              // A touchscreen was used
              pressure = 1.0;
              context.strokeStyle = "red";
              context.lineWidth = pressure;
              break;
            case "pen":
              // A pen was used
              //context.strokeStyle = buttonProps.get(primaryColorButton.id);
              context.strokeStyle = "black";
              context.lineWidth = pressure;
              break;
            case "mouse":
              // A mouse was used
              //pressure = 2;
              //context.lineWidth = pressure;
              context.strokeStyle = "black";
              context.lineWidth = pressure;
              break;
          }

          // If pen erase button is being used, then erase!
          // if (buttons === EPenButton.eraser) {
          //   console.log("eraser")
          //   context.strokeStyle = "white";
          // }

          //when users click on the lower button of the pen
          //it sends the captured image to canvas

          switch (evt.type) {
            case "pointerdown":
              isDrawing = true;
              posLast = pos;
              //detected button clicking
              if (buttons === EPenButton.barrel) {
                updateExtractToCanvas();
              }

              const currentTime = new Date().getTime();
              const timeDifference = currentTime - lastClickTime;

              if (timeDifference < doubleClickThreshold) {
                //Pen lower button clicked; detect as double click here
                // set using wacom center
                // Handle double-click logic here
                extractWholeImage();
              }

              lastClickTime = currentTime;

              break;
            case "pointerup":
              isDrawing = false;
              closeDrawingPath(pointsArr);
              pointsArr = [];
              break;
            case "lostpointercapture":
              break;
            case "pointermove":
              if (!isDrawing) {
                return;
              }

              // If using eraser button, then erase with background color.
              if (pressure > 0) {
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
              document.body.style.cursor = "crosshair";
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

      function closeDrawingPath(points) {
        if (points.length > 0) {
          context.clearRect(0, 0, myCanvas.width, myCanvas.height);
          context.beginPath();
          context.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            context.lineTo(points[i].x, points[i].y);
          }

          context.closePath();
          context.save();
          context.fillStyle = "rgba(255, 255, 255," + maskTransparency + ")";

          //context.fill();
          context.fillRect(0, 0, myCanvas.width, myCanvas.height);
          context.globalCompositeOperation = "destination-in";
          context.fillStyle = "white";
          context.fill();
          context.restore();
        }
      }

      // Function to get the bounding box of the path
      function getPathBoundingBox(ctx) {
        const width = myCanvas.width;
        const height = myCanvas.height;

        let minX = width,
          minY = height,
          maxX = 0,
          maxY = 0;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            if (ctx.isPointInPath(x, y)) {
              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
            }
          }
        }

        extractPayload.left = minX;
        extractPayload.top = minY;
        extractPayload.width = maxX - minX;
        extractPayload.height = maxY - minY;
        //console.log(extractPayload);
      }

      //Assume pointer events are supported by default

      // if Pointer Events are supported, only listen to pointer events
      for (var idx = 0; idx < pointerEvents.length; idx++) {
        myCanvas.addEventListener(pointerEvents[idx], pointerEventDraw, false);
      }
    });
    return {
      imgFitWidth,
      imgFitHeight,
      extractPayload,
      uploadEleSize,
      maskTransparency,
      canvasStore,
      inStroke,
      posLast,
      isDrawing,
      pointsArr,
      EPenButton,
    };
  },

  data() {
    return {
      width: 500,
      height: 500,
      top: 600,
      left: 600,
    };
  },
  methods: {
    clearCanvas() {
      let myCanvas = document.getElementById("mainCanvas");
      let context = myCanvas.getContext("2d");
      //context.fillStyle = colorBackground;
      context.clearRect(0, 0, myCanvas.width, myCanvas.height);
    },

    setCanvasProps() {
      this.clearCanvas(); // ensures background saved with drawn image
    },

    saveCanvas() {
      let myCanvas = document.getElementById("mainCanvas");
      const link = document.getElementById("link");
      link.setAttribute("download", "Scribble.png");
      link.setAttribute(
        "href",
        myCanvas
          .toDataURL("image/png")
          .replace("image/png", "image/octet-stream"),
      );
      link.click();
    },
  },
};
</script>

<style scoped>
.myCanvas {
  z-index: 1;
  touch-action: none; /*prevent canvas scrolling and system touch behavior*/
  /* This doesn't ensure background color saved in image.
      background-color: tan;
      See https://stackoverflow.com/questions/6957034/save-canvas-with-background-image
  */
}
</style>
