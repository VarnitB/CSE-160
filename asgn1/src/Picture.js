// Picture.js

function drawMyPicture() {
  // Placeholder picture for now.
  // We will replace this with your real custom triangle drawing next.

  g_shapesList = [];

  const tri1 = new Triangle();
  tri1.position = [-0.4, 0.2];
  tri1.color = [1.0, 0.0, 0.0, 1.0];
  tri1.size = 60;
  g_shapesList.push(tri1);

  const tri2 = new Triangle();
  tri2.position = [0.0, 0.0];
  tri2.color = [0.0, 1.0, 0.0, 1.0];
  tri2.size = 60;
  g_shapesList.push(tri2);

  const tri3 = new Triangle();
  tri3.position = [0.4, -0.2];
  tri3.color = [0.0, 0.0, 1.0, 1.0];
  tri3.size = 60;
  g_shapesList.push(tri3);

  renderAllShapes();
}