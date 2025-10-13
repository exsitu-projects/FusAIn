<script>
import { onMounted } from "vue";
import { useCanvas } from "@/stores/canvasStore";

export default {
  props: { mainCanvasSize: Number },
  name: "maskCanvas",
  setup(props) {
    const localCanvasSize = props.mainCanvasSize;
    const canvasStore = useCanvas();
    let pointsArr = [];
    const maskTransparency = 0.7;
    let EPenButton = {
      tip: 0x1, // left mouse, touch contact, pen contact
      barrel: 0x2, // right mouse, pen barrel button
      middle: 0x4, // middle mouse
      eraser: 0x20, // pen eraser button
    };
    let inStroke = false;
    let posLast = { x: 0, y: 0 };
    let isDrawing = false;
    onMounted(() => {
      let localMaskCanvas = document.getElementById("localMaskCanvas");
      let context = localMaskCanvas.getContext("2d", {
        willReadFrequently: true,
      });
      context.clearRect(0, 0, localMaskCanvas.width, localMaskCanvas.height);

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

      /////////////////////////////////////////////////////////////////////////
      // Find point between two other points.
      //
      function midPointBetween(p1, p2) {
        return {
          x: p1.x + (p2.x - p1.x) / 2,
          y: p1.y + (p2.y - p1.y) / 2,
        };
      }

      function closeDrawingPath(points) {
        //context.clearRect(0, 0, localMaskCanvas.width, localMaskCanvas.height);
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          context.lineTo(points[i].x, points[i].y);
        }

        context.closePath();
        context.lineWidth = 5;
        context.fillStyle = "rgba(128, 128, 128)";
        context.fill();
      }

      /////////////////////////////////////////////////////////////////////////
      // Handle drawing for HTML5 Pointer Events.
      //
      function pointerEventDraw(evt) {
        let canvasRect = localMaskCanvas.getBoundingClientRect();
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
              context.strokeStyle = "rgba(128, 128, 128)";
              context.lineWidth = pressure;
              break;
            case "mouse":
              // A mouse was used
              //pressure = 2;
              //context.lineWidth = pressure;
              context.strokeStyle = "rgba(128, 128, 128)";
              context.lineWidth = pressure;
              break;
          }
          if (canvasStore.penTipColor === "white") {
            // if erase using eraser color - white; not properly write, might change later
            ////TODO
            context.strokeStyle = canvasStore.penTipColor;
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
                //updateExtractToCanvas();
              }

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
                if (
                  buttons === EPenButton.eraser ||
                  canvasStore.eraser.status === true
                ) {
                  context.fill;
                  context.globalCompositeOperation = "destination-out"; //erase
                } else {
                  context.globalCompositeOperation = "source-over"; // brush
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

      for (let idx = 0; idx < pointerEvents.length; idx++) {
        localMaskCanvas.addEventListener(
          pointerEvents[idx],
          pointerEventDraw,
          false,
        );
      }
    });
    return {
      canvasStore,
      maskTransparency,
      localCanvasSize,
      pointsArr,
      EPenButton,
      inStroke,
      posLast,
      isDrawing,
    };
  },
};
</script>

<template>
  <canvas
    id="localMaskCanvas"
    :height="localCanvasSize"
    :width="localCanvasSize"
    @contextmenu.prevent=""
  ></canvas>
</template>

<style scoped>
#localMaskCanvas {
  touch-action: none; /*prevent canvas scrolling and system touch behavior*/
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 0;
}
</style>
