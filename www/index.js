import {Universe, Cell} from "rust-wasm-game-of-life";
import { memory } from "rust-wasm-game-of-life/rust_wasm_game_of_life_bg";
// stats
javascript:(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='https://mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()

const CELL_SIZE = 3; // px
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

const drawTypeEnum = {
    Cell: 0,
    Glider: 1,
    Pulsar: 2,
}

// Construct the universe, and get its width and height.
let universe = Universe.new(200,200);
const width = universe.width();
const height = universe.height();

// Give the canvas room for all of our cells and a 1px border
// around each of them.
const canvas = document.getElementById("game-of-life-canvas");
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

const ctx = canvas.getContext('2d');

const drawGrid = () => {
    ctx.beginPath();
    ctx.strokeStyle = GRID_COLOR;
  
    // Vertical lines.
    for (let i = 0; i <= width; i++) {
      ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
      ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
    }
  
    // Horizontal lines.
    for (let j = 0; j <= height; j++) {
      ctx.moveTo(0,                           j * (CELL_SIZE + 1) + 1);
      ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
    }
  
    ctx.stroke();
  };

const getIndex = (row, column) => {
    return row * width + column;
};
  
const drawCells = () => {
    const cellsPtr = universe.cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

    ctx.beginPath();

    // Alive cells.
    ctx.fillStyle = ALIVE_COLOR;
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = getIndex(row, col);
            if (cells[idx] !== Cell.Alive) {
            continue;
            }

            ctx.fillRect(
            col * (CELL_SIZE + 1) + 1,
            row * (CELL_SIZE + 1) + 1,
            CELL_SIZE,
            CELL_SIZE
            );
        }
    }

    // Dead cells.
    ctx.fillStyle = DEAD_COLOR;
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = getIndex(row, col);
            if (cells[idx] !== Cell.Dead) {
            continue;
            }

            ctx.fillRect(
            col * (CELL_SIZE + 1) + 1,
            row * (CELL_SIZE + 1) + 1,
            CELL_SIZE,
            CELL_SIZE
            );
        }
    }

    ctx.stroke();
};

const renderLoop = () => {
  drawGrid();
  drawCells();

  universe.tick();

  timeoutId = setTimeout(() => {
    animationId = requestAnimationFrame(renderLoop);
  }, 1000 / fpsRange.value);
};

const isPaused = () => {
    return animationId === null;
};

const play = () => {
    playPauseButton.textContent = "⏸";
    renderLoop();
};

const pause = () => {
    playPauseButton.textContent = "▶️";
    cancelAnimationFrame(animationId);
    clearTimeout(timeoutId);
    animationId = null;
    drawGrid();
    drawCells();
};

const playPause = () => {
    if (isPaused()) {
        play();
    } else {
        pause();
    }
};

const drawGlider = (row, col) => {
    let x_rotate = ((Math.random() < 0.5) ? -1: 1); 
    let y_rotate = ((Math.random() < 0.5) ? -1: 1); 

    universe.toggle_cell(x_rotate*0+row,y_rotate*2+col);
    universe.toggle_cell(x_rotate*1+row,y_rotate*0+col);
    universe.toggle_cell(x_rotate*1+row,y_rotate*2+col);
    universe.toggle_cell(x_rotate*2+row,y_rotate*1+col);
    universe.toggle_cell(x_rotate*2+row,y_rotate*2+col);
};

const drawPulsar = (row, col) => {
    for (let x_rotate of [-1,1]) {
        for (let y_rotate of [-1,1]){
            universe.toggle_cell(row+1*x_rotate,col+2*y_rotate);
            universe.toggle_cell(row+1*x_rotate,col+3*y_rotate);
            universe.toggle_cell(row+1*x_rotate,col+4*y_rotate);
            universe.toggle_cell(row+2*x_rotate,col+1*y_rotate);
            universe.toggle_cell(row+2*x_rotate,col+6*y_rotate);
            universe.toggle_cell(row+3*x_rotate,col+1*y_rotate);
            universe.toggle_cell(row+3*x_rotate,col+6*y_rotate);
            universe.toggle_cell(row+4*x_rotate,col+1*y_rotate);
            universe.toggle_cell(row+4*x_rotate,col+6*y_rotate);
            universe.toggle_cell(row+6*x_rotate,col+2*y_rotate);
            universe.toggle_cell(row+6*x_rotate,col+3*y_rotate);
            universe.toggle_cell(row+6*x_rotate,col+4*y_rotate);
        };
    };
};

const eventDrawCells = (drawType) => {
    if (isMouseClicked) {
        const boundingRect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / boundingRect.width;
        const scaleY = canvas.height / boundingRect.height;

        const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
        const canvasTop = (event.clientY - boundingRect.top) * scaleY;

        const row = Math.min(Math.trunc(canvasTop / (CELL_SIZE + 1)), height - 1);
        const col = Math.min(Math.trunc(canvasLeft / (CELL_SIZE + 1)), width - 1);

        if (drawType === drawTypeEnum.Cell) {
            if (lastRowToggled != (row, col)){
                universe.toggle_cell(row, col);
                lastRowToggled = (row, col);

                drawCells();
            };
        }else if (drawType === drawTypeEnum.Glider) {
            drawGlider(row, col);
            drawCells();
        }else if (drawType === drawTypeEnum.Pulsar) {
            drawPulsar(row, col);
            drawCells();
        };
    }
};

canvas.addEventListener("mousedown", event => {
    isMouseClicked = true;
    if (event.ctrlKey){
        eventDrawCells(drawTypeEnum.Glider);
    }else if (event.shiftKey) {
        eventDrawCells(drawTypeEnum.Pulsar);
    }else {
        eventDrawCells(drawTypeEnum.Cell);
    };
});

canvas.addEventListener("mouseup", event => {
    isMouseClicked = false;
});
canvas.addEventListener("mouseout", event => {
    isMouseClicked = false;
});

canvas.addEventListener("mousemove", event => {
    if (event.ctrlKey){
        eventDrawCells(drawTypeEnum.Glider);
    }else if (event.shiftKey) {
        eventDrawCells(drawTypeEnum.Pulsar);
    }else {
        eventDrawCells(drawTypeEnum.Cell);
    };
});

let animationId = null;
let timeoutId = null;
let isMouseClicked = false;
let lastRowToggled = (null, null);

const fpsRange = document.getElementById("fpsRange");
const fpsRangeIndicator = document.getElementById("fpsIndicator");
fpsRangeIndicator.value = fpsRange.value;
const playPauseButton = document.getElementById("play-pause");
const resetButton = document.getElementById("resetButton");
const randomButton = document.getElementById("randomButton");
const nextTickButton = document.getElementById("nextTick");
const dracarysButton = document.getElementById("dracarysButton");

fpsRange.addEventListener("input", event => {
    fpsRangeIndicator.value = fpsRange.value;
});
fpsRangeIndicator.addEventListener("input", event => {
    fpsRange.value = fpsRangeIndicator.value;
});

playPauseButton.addEventListener("click", event => {
    playPause();
});
nextTickButton.addEventListener("click", event => {
    universe.tick();
    drawGrid();
    drawCells();
});
resetButton.addEventListener("click", event => {
    universe = Universe.new(200,200);
    drawGrid();
    drawCells();
});
randomButton.addEventListener("click", event => {
    universe = Universe.new_random(200,200);
    drawGrid();
    drawCells();
});
dracarysButton.addEventListener("click", event => {
    universe.clear_universe();
    drawGrid();
    drawCells();
});

document.addEventListener("keyup", event => {
    if (event.code === 'Space') {
        playPause();
    };
});

// disable left click opens contextmenu on canvas
document.getElementById("game-of-life-canvas").addEventListener('contextmenu', event => event.preventDefault());

drawGrid();
drawCells();

play();