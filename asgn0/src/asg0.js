let canvas;
let ctx;

function main() {
  canvas = document.getElementById('example');
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element');
    return;
  }

  ctx = canvas.getContext('2d');
  if (!ctx) {
    console.log('Failed to get 2D context');
    return;
  }

  clearCanvas();

  let v1 = new Vector3([2.25, 2.25, 0]);
  drawVector(v1, 'red');
}

function clearCanvas() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawVector(v, color) {
  const scale = 20;
  const originX = canvas.width / 2;
  const originY = canvas.height / 2;

  const x = originX + v.elements[0] * scale;
  const y = originY - v.elements[1] * scale;

  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(x, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function getVectorInputs() {
  const v1x = parseFloat(document.getElementById('v1x').value) || 0;
  const v1y = parseFloat(document.getElementById('v1y').value) || 0;
  const v2x = parseFloat(document.getElementById('v2x').value) || 0;
  const v2y = parseFloat(document.getElementById('v2y').value) || 0;

  const v1 = new Vector3([v1x, v1y, 0]);
  const v2 = new Vector3([v2x, v2y, 0]);

  return { v1, v2 };
}

function handleDrawEvent() {
  clearCanvas();

  const { v1, v2 } = getVectorInputs();

  drawVector(v1, 'red');
  drawVector(v2, 'blue');
}

function handleDrawOperationEvent() {
  clearCanvas();

  const { v1, v2 } = getVectorInputs();
  const operation = document.getElementById('operation').value;
  const scalar = parseFloat(document.getElementById('scalar').value);

  drawVector(v1, 'red');
  drawVector(v2, 'blue');

  if (operation === 'add') {
    let v3 = new Vector3(v1.elements);
    v3.add(v2);
    drawVector(v3, 'green');
  } else if (operation === 'sub') {
    let v3 = new Vector3(v1.elements);
    v3.sub(v2);
    drawVector(v3, 'green');
  } else if (operation === 'mul') {
    let v3 = new Vector3(v1.elements);
    let v4 = new Vector3(v2.elements);
    v3.mul(scalar);
    v4.mul(scalar);
    drawVector(v3, 'green');
    drawVector(v4, 'green');
  } else if (operation === 'div') {
    if (scalar === 0) {
      console.log('Cannot divide by zero.');
      return;
    }

    let v3 = new Vector3(v1.elements);
    let v4 = new Vector3(v2.elements);
    v3.div(scalar);
    v4.div(scalar);
    drawVector(v3, 'green');
    drawVector(v4, 'green');
  } else if (operation === 'magnitude') {
    console.log('Magnitude v1:', v1.magnitude());
    console.log('Magnitude v2:', v2.magnitude());
  } else if (operation === 'normalize') {
    let v3 = new Vector3(v1.elements);
    let v4 = new Vector3(v2.elements);
    v3.normalize();
    v4.normalize();
    drawVector(v3, 'green');
    drawVector(v4, 'green');
  } else if (operation === 'angleBetween') {
    console.log('Angle between v1 and v2:', angleBetween(v1, v2), 'degrees');
  } else if (operation === 'areaTriangle') {
    console.log('Area of the triangle:', areaTriangle(v1, v2));
  }
}

function angleBetween(v1, v2) {
  const mag1 = v1.magnitude();
  const mag2 = v2.magnitude();

  if (mag1 === 0 || mag2 === 0) {
    return 0;
  }

  let cosAlpha = Vector3.dot(v1, v2) / (mag1 * mag2);
  cosAlpha = Math.max(-1, Math.min(1, cosAlpha));

  const angleRadians = Math.acos(cosAlpha);
  return angleRadians * 180 / Math.PI;
}

function areaTriangle(v1, v2) {
  const crossProduct = Vector3.cross(v1, v2);
  const parallelogramArea = crossProduct.magnitude();
  return parallelogramArea / 2;
}