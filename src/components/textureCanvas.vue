<script>
import { onMounted } from "vue";
import { useCanvas } from "@/stores/canvasStore";
import P5 from "p5";
export default {
  props: { mainCanvasSize: Number },
  name: "textureCanvas",
  setup(props) {
    const canvasStore = useCanvas();
    let EPenButton = {
      tip: 0x1, // left mouse, touch contact, pen contact
      barrel: 0x2, // right mouse, pen barrel button
      middle: 0x4, // middle mouse
      eraser: 0x20, // pen eraser button
    };
    onMounted(() => {
      const script = (p5) => {
        let brushCounter = 0;
        let brushCounterLimit = canvasStore.brush.gap;
        let img;
        let penErase = false;
        var fakeElement = document.getElementById("fakeElement");
        fakeElement.addEventListener("click", () => {
          img = p5.loadImage(canvasStore.currentExtractPath);
        });
        const textureCanvas = document.getElementById("textureCanvas");
        textureCanvas.addEventListener("pointermove", (evt) => {
          penErase = evt.buttons === EPenButton.eraser;
        });
        var clearBtn = document.getElementById("clearBtn");
        clearBtn.addEventListener("click", () => {
          p5.clear();
        });
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
          textureCanvas.style.cursor = `url('${svgDataURL}') ${brushSize / 2} ${brushSize / 2}, auto`;
        }
        function increaseBrushCounter() {
          brushCounter++;
          if (brushCounter > brushCounterLimit) {
            brushCounter = 0;
          }
        }
        // These are your typical setup() and draw() methods
        p5.preload = () => {
          img = p5.loadImage("assets/images/brush/black.png");
        };
        p5.setup = () => {
          p5.createCanvas(props.mainCanvasSize, props.mainCanvasSize);
        };
        p5.mouseMoved = () => {
          updateCursor(canvasStore.brush.size, "#fff");
        };
        p5.draw = () => {
          brushCounterLimit = canvasStore.brush.gap;

          if (p5.mouseIsPressed === true && canvasStore.currentPenId === 3) {
            if (canvasStore.eraser.status === true || penErase === true) {
              p5.erase();
              // p5.ellipse(p5.mouseX, p5.mouseY, 10, 10); // Small circle at mouse position
              p5.strokeWeight(canvasStore.brush.size);
              p5.line(p5.pmouseX, p5.pmouseY, p5.mouseX, p5.mouseY);
            } else {
              p5.noErase();
              //texture layer
              increaseBrushCounter();
              // find the midpoint between the current and previous mouse points
              const midX = p5.mouseX - canvasStore.brush.size / 2;
              const midY =
                p5.mouseY -
                canvasStore.brush.size / canvasStore.brush.whRatio / 2;
              if (brushCounter === 0) {
                p5.image(
                  img,
                  midX,
                  midY,
                  canvasStore.brush.size,
                  canvasStore.brush.size / canvasStore.brush.whRatio,
                );
              }
            }
          }
        };
      };
      // Attach the canvas to the div
      new P5(script, "textureCanvas");
    });
    return { canvasStore, EPenButton };
  },
};
</script>

<template>
  <div id="textureCanvas" class="nonColor" @contextmenu.prevent=""></div>
  <button style="display: none" id="fakeElement"></button>
</template>

<style>
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
</style>
