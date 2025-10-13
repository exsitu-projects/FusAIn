<script>
import { onMounted } from "vue";
import { useCanvas } from "@/stores/canvasStore";

export default {
  props: { mainCanvasSize: Number },
  name: "colorCanvas",
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
    let brush = canvasStore.brush;
    onMounted(() => {
      let canvas = document.getElementById("colorCanvas");
      let context = canvas.getContext("2d", {
        willReadFrequently: true,
      });
      context.clearRect(0, 0, canvas.width, canvas.height);

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

        if (evt.pointerType) {
          if (evt.pointerType === "pen" || evt.pointerType === "mouse") {
            // A pen was used

            // use brush
            context.lineWidth = Math.max(
              brush.size * 0.5,
              brush.size * pressure,
            );
            if (canvasStore.colorSource === 0) {
              //0:self defined; 1:from extracted palette
              context.strokeStyle = brush.color;
            } else if (canvasStore.colorSource === 1) {
              context.strokeStyle = "rgb(" + canvasStore.currentColor + ")";
            }
          }

          // document.body.style.cursor = "crosshair";
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
              if (pressure > 0 && canvasStore.currentPenId === 1) {
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
              // document.body.style.cursor = "crosshair";
              // Function to generate an SVG cursor based on pen properties
              updateCursor(
                Math.max(brush.size * 0.5, brush.size * pressure),
                brush.color,
              );
              console.log("pointerenter");
              // Update the cursor initially

              break;

            case "pointerleave":
              canvas.style.cursor = "default";
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
    id="colorCanvas"
    :height="localCanvasSize"
    :width="localCanvasSize"
    @contextmenu.prevent=""
  ></canvas>
</template>

<style scoped>
#colorCanvas {
  touch-action: none; /*prevent canvas scrolling and system touch behavior*/
  position: absolute;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 0;
}
</style>
