let canvas;
var elem = document.documentElement;
let length
let vectorCount = 0;
let angle = 4.6;
let angleMin = 4.6;
let angleMax = 6.28;
let angleLeft = 0;
let angleRight = 0;
let leftLen = 0.5;
let rightLen = 0.5;
let invertAngle = false;
let leafPropsDict = {}
let ogLeafPropsDict;
let leaves = []
let ogLeaves;
let mousePos = { x: 0, y: 0 }
let count = 0;
let isResettingLeaves = false;
let newLeaves = [];
let canvasWidth;
let canvasHeight;

const kaleidoscopeColors = [
  '#FF0000',
  '#FF7F00',
  '#FFFF00',
  '#00FF00',
  '#0000FF',
  '#4B0082',
  '#9400D3'
]

const treeColors = [
  //['Name', 'Branch Color', 'Leaf Color','Background Color']
  ['Sapphire Blaze', '#FF0000', '#FF0000', '#0000FF'],
  ['Neon Horizon', '#00FF00', '#00FF00', '#4955FD'],
  ['Amber Midnight', '#F49F1C', '#F49F1C', '#030E4F'],
  ['Twilight Brass', '#143d59', '#143d59', '#f4b41a'],
  ['Cyan Noir', '#00FFFF', '#00FFFF', '#000000'],
  ['Whiteboard', '#000000', '#FFFFFF', '#FFFFFF'],
  ['Monochrome Blaze', '#000000', '#FF0000', '#FFFFFF'],
  ['Black on White', '#000000', '#000000', '#FFFFFF'],
  ['White on Black', '#FFFFFF', '#FFFFFF', '#000000'],
  ['Kaleidoscope', '#000000', 'kaleidoscope', '#FFFFFF'],
  ['Inverse Kaleidoscope', '#FFFFFF', 'kaleidoscope', '#000000'],
  ['Bronze Harbor', '#A77E58', '#2b5b87', '#2b5b87'],
  ['Flamingo Gold', '#e71989', '#e71989', '#ffe042'],
  ['Desert', '#514644', '#514644', '#efc8b1'],
  ['Azure Mint', '#0048ba', '#6dd47e', '#ffd55a'],
  ['Coral', '#ff4040', '#ff4040', '#ffaa91'],
  ['Sunset', '#ffaa91', '#ffaa91', '#ff4040'],
  ['Lavender', '#b57edc', '#b57edc', '#f4b41a'],
  ['Rustic Navy', '#2b5b87', '#2b5b87', '#A77E58'],
  ['Gold Navy', '#f4b41a', '#f4b41a', '#143d59'],
  ['Fuchsia Colar', '#ff00ff', '#ff00ff', '#00ff80'],
  ['Turquoise Salmon', '#40e0d0', '#40e0d0', '#e04050'],
  ['Indigo Green', '#4b0082', '#4b0082', '#378200'],
  ['Amber Royal', '#ffbf00', '#ffbf00', '#bf00ff'],
  ['Azure Cyan', '#00ffff', '#00ffff', '#0048ba'],
  ['Midnight Sky', '#000000', '#000000', '#0048ba']

]
let leafColor;
let treeColorName;
let branchColor;
let backgroundColor;
let treeColorObject;

const leafShapes = ['Ellipse', 'Triangle', 'Orthogonal']
let leafShape;
let minLeafSize = 3;
let maxLeafSize = 25;
let treeHeight=0;
let margin=0;
let branchProportion =10
let isResizing = false;

function setup() {
  canvasWidth = windowWidth;
  canvasHeight = canvasWidth;

  if (canvasHeight > windowHeight) {
    canvasHeight = windowHeight;
  }

  createCanvas(canvasWidth, canvasHeight);
  canvas = document.querySelector('canvas');

  canvas.addEventListener('mousemove', function (event) {
    mousePos = getMouseHoverPosOnCanvas(canvas, event);
    //   console.log('Mouse hover position on canvas: ', mousePos);
  });

  leftLen = hl.random(55, 70) / 100
  rightLen = hl.random(55, 70) / 100
  leftAngle = hl.random(50, 60) / 10
  rightAngle = hl.random(50, 65) / 10
  invertAngle = hl.randomBool(0.50)
  if (invertAngle) {
    let temp = leftAngle
    leftAngle = rightAngle
    rightAngle = temp
  }


  treeColorObject = hl.randomElement(treeColors)
  treeColorName = treeColorObject[0]
  branchColor = treeColorObject[1]
  leafColor = treeColorObject[2]
  backgroundColor = treeColorObject[3]

  leafShape = hl.randomElement(leafShapes)



  if (leftAngle >= 6.1 && rightAngle >= 6.1) {
    console.log("leftAngle: " + leftAngle + " rightAngle: " + rightAngle)
    leftAngle = 5.9;
    rightAngle = 6.1;
  }


  //print all angle and length properties
  console.log("leftLen: " + leftLen)
  console.log("rightLen: " + rightLen)
  console.log("leftAngle: " + leftAngle)
  console.log("rightAngle: " + rightAngle)
  console.log("treeColor: " + treeColorName)

  calculateProportions()

  calculateTree()
  ogLeaves = leaves.slice();
  ogLeafPropsDict = leafPropsDict;

  prepareToken();

}

function prepareToken() {
  let traits = {
      "Colour Palette": treeColorObject[0],
      "Leaf Shape": leafShape
  };

  hl.token.setTraits(traits);
  hl.token.setName(`Dendron #${hl.tx.tokenId}`);
  hl.token.setDescription(
      `Dendron is a generative art project that explores the beauty of natural forms through interactive fractal trees.      

      The trees have varied branch growth patterns that are implemented with an L-System.     
            
      Try touching or hovering your mouse over them. The trees respond by quivering their branches and leaves.` 
  );
}

function windowResized() {
  treeHeight=0;
  isResizing = true;  // Set the flag when resizing
  canvasWidth = windowWidth;
  canvasHeight = windowHeight;

  if (canvasHeight > windowHeight) {
    canvasHeight = windowHeight;
  }
  resizeCanvas(canvasWidth, canvasHeight);
  calculateProportions();
}

function clearLeaves() {
  leaves = []
  ogLeaves = []
  newLeaves = []
  leafPropsDict = {}
  ogLeafPropsDict = {}
}

//length * branchproportion = 10


function resetLeaves() {
  isResettingLeaves = true;
  newLeaves = [];  
  leaves = cloneArray(ogLeaves);
  leafPropsDict = Object.assign({}, ogLeafPropsDict);
  isResettingLeaves = false;
 
}

function cloneArray(arr) {
  return arr.map(pos => pos.slice());
}

function calculateProportions() {
  length = canvasHeight / 3.9;
  minLeafSize = length / 20;
  maxLeafSize = length / 10;
  branchProportion =length/20

}

function calculateTree() {
  let root = createVector(0, 0, -PI / 2);
  branch(root, length, angle);
  drawLeaves()
}

function draw() {
  background(color(backgroundColor));
  setBodyBackgroundColor(backgroundColor);

  margin=(height+treeHeight)/2
  translate(width / 2, height-margin);
   
  if (isResizing) {
    windowResized()
    clearLeaves();
    resetLeaves();
    isResizing = false;  
  }
  
  calculateTree(); 
}

function setBodyBackgroundColor(color) {
  document.body.style.backgroundColor = color;
}

function branch(start, len, angle) {  

  stroke(branchColor);
  strokeWeight(2);

  line(start.x, start.y, start.x + cos(start.z) * len, start.y + sin(start.z) * len);

  let tmpRightAngle = rightAngle
  let tmpLeftAngle = leftAngle

  if (mouseNear(start.x + cos(start.z) * len, start.y + sin(start.z) * len) && mouseHasMoved()) {
    tmpRightAngle = rightAngle + hl.random(-0.03, 0.03)
    tmpLeftAngle = leftAngle + hl.random(-0.03, 0.03)
  }

  if (len > branchProportion) {
    // Right branch
    let left = createVector(start.x + cos(start.z) * len, start.y + sin(start.z) * len, start.z - tmpRightAngle);
    branch(left, len * rightLen, rightAngle);  // Pass angle as a parameter

    // Left branch
    let right = createVector(start.x + cos(start.z) * len, start.y + sin(start.z) * len, start.z + tmpLeftAngle);
    branch(right, len * leftLen, leftAngle);  // Pass angle as a parameter
  }

  // Calculate the end position of each final branch
  let endX = start.x + cos(start.z) * len;
  let endY = start.y + sin(start.z) * len;

  if(endY<treeHeight){
    treeHeight=endY
  }

  if (len<branchProportion) {
    // Add leaves only when the length is less than 10
    let endX = start.x + cos(start.z) * len;
    let endY = start.y + sin(start.z) * len;
    newLeaves.push([endX, endY]);
    getLeafProps(endX, endY);
  }

}

function drawLeaves() {

  push();
  strokeWeight(2);
  // Draw leaves based on the original array
  for (let i = 0; i < leaves.length; i++) {
    let leaf = leaves[i];
    let x = leaf[0];
    let y = leaf[1];

    if (leafShape == 'Ellipse') {
      drawEllipticalLeaf(x, y, ogLeafPropsDict[[x, y]]);
    }
    if (leafShape == 'Triangle') {
      drawLeafTriangle(x, y, ogLeafPropsDict[[x, y]]);
    }
    if (leafShape == 'Orthogonal') {
      drawLeafOrthogonal(x, y, ogLeafPropsDict[[x, y]]);
    }
  }

  // Draw newly added leaves
  for (let i = 0; i < newLeaves.length; i++) {
    let leaf = newLeaves[i];
    let x = leaf[0];
    let y = leaf[1];

    if (leafShape == 'Ellipse') {
      drawEllipticalLeaf(x, y, leafPropsDict[[x, y]]);
    }
    if (leafShape == 'Triangle') {
      drawLeafTriangle(x, y, leafPropsDict[[x, y]]);
    }
    if (leafShape == 'Orthogonal') {
      drawLeafOrthogonal(x, y, leafPropsDict[[x, y]]);
    }
  }

  // Clear the newLeaves array after drawing
  newLeaves = [];
  pop()
}

function drawLeafTriangle(x, y, leafProps) {
  if (leafProps) {
    let sizeX = leafProps[0];
    let sizeY = leafProps[1];
    let leafCl = leafProps[2];
    let cl = (leafColor == 'kaleidoscope') ? leafCl : leafColor;
    fill(color(cl));
    triangle(x, y, x - sizeX / 2, y + sizeY, x + sizeX / 2, y + sizeY);
  }
}

function drawEllipticalLeaf(x, y, leafProps) {
  if (leafProps) {
    let sizeX = leafProps[0];
    let sizeY = leafProps[1];
    let leafCl = leafProps[2];
    let cl = (leafColor == 'kaleidoscope') ? leafCl : leafColor;
    fill(color(cl));
    ellipse(x, y, sizeX, sizeY);
  }
}

function drawLeafOrthogonal(x, y, leafProps) {
  if (leafProps) {
    let sizeX = leafProps[0];
    let sizeY = leafProps[1];
    let leafCl = leafProps[2];
    let cl = (leafColor == 'kaleidoscope') ? leafCl : leafColor;
    fill(color(cl));
    rect(x - sizeX / 2, y - sizeY / 2, sizeX, sizeY);
  }
}

function getLeafProps(x, y) {
  let leafKey = x + ',' + y;
  if (leafPropsDict.hasOwnProperty(leafKey)) {
    return leafPropsDict[leafKey];
  } else {
    let newLeafProps = [hl.random(minLeafSize, maxLeafSize), hl.random(minLeafSize, maxLeafSize), hl.randomElement(kaleidoscopeColors)];
    leafPropsDict[leafKey] = newLeafProps;
    return newLeafProps;
  }
}


//a function that checks if mouse pointer is near a leaf and returns tru or false
function mouseNear(x, y) {
  let mouseX = mousePos.x - width / 2
  let mouseY = mousePos.y - height + margin

  let d = dist(mouseX, mouseY, x, y)
  if (d < 50) {   
    return true
  } else {
    return false
  }
}

function getMouseHoverPosOnCanvas(canvas, event) {
  var rect = canvas.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;
  return { x: x, y: y };
}

function keyTyped() {
  switch (key) {
    case "s":
      saveCanvas();
      break;
    case "f":
      openFullscreen();
      break;
  }
}

function openFullscreen() {
  if (document.fullscreenElement) {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => setTimeout(windowResized, 500));
    } else if (document.webkitExitFullscreen) { /* Safari */
      document.webkitExitFullscreen().then(() => setTimeout(windowResized, 500));
    } else if (document.msExitFullscreen) { /* IE11 */
      document.msExitFullscreen().then(() => setTimeout(windowResized, 500));
    }
    clearLeaves();
    resetLeaves();
  } else {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
      elem.msRequestFullscreen();
    }
  }
}

function mouseHasMoved() {
  return mouseX !== pmouseX || mouseY !== pmouseY;
}

function touchMoved() {
  mousePos = { x: mouseX, y: mouseY }
  return true; // to prevent scrolling
} 



document.addEventListener("fullscreenchange", function () {
  if (!document.fullscreenElement) {  
    isResizing = true;
  }
});
