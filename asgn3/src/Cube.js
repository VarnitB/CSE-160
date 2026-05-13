// Cube.js
// Textured/color cube used for ground, sky, walls, and goal block

class Cube {
  constructor() {
    this.type = "cube";
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();

    // -1 = solid color only
    // 0 = wall
    // 1 = grass
    // 2 = dirt
    // 3 = sky
    // 4 = goal/gold
    this.textureNum = -1;

    // 0.0 = only base color
    // 1.0 = only texture
    this.texColorWeight = 1.0;
  }

  static initBuffer(gl) {
    if (Cube.vertexBuffer) return;

    // Each vertex: x, y, z, u, v
    // 36 vertices = 12 triangles = full cube
    const vertices = new Float32Array([
      // Front face
      0, 0, 1, 0, 0,
      1, 0, 1, 1, 0,
      1, 1, 1, 1, 1,
      0, 0, 1, 0, 0,
      1, 1, 1, 1, 1,
      0, 1, 1, 0, 1,

      // Back face
      1, 0, 0, 0, 0,
      0, 0, 0, 1, 0,
      0, 1, 0, 1, 1,
      1, 0, 0, 0, 0,
      0, 1, 0, 1, 1,
      1, 1, 0, 0, 1,

      // Top face
      0, 1, 1, 0, 0,
      1, 1, 1, 1, 0,
      1, 1, 0, 1, 1,
      0, 1, 1, 0, 0,
      1, 1, 0, 1, 1,
      0, 1, 0, 0, 1,

      // Bottom face
      0, 0, 0, 0, 0,
      1, 0, 0, 1, 0,
      1, 0, 1, 1, 1,
      0, 0, 0, 0, 0,
      1, 0, 1, 1, 1,
      0, 0, 1, 0, 1,

      // Right face
      1, 0, 1, 0, 0,
      1, 0, 0, 1, 0,
      1, 1, 0, 1, 1,
      1, 0, 1, 0, 0,
      1, 1, 0, 1, 1,
      1, 1, 1, 0, 1,

      // Left face
      0, 0, 0, 0, 0,
      0, 0, 1, 1, 0,
      0, 1, 1, 1, 1,
      0, 0, 0, 0, 0,
      0, 1, 1, 1, 1,
      0, 1, 0, 0, 1,
    ]);

    Cube.vertexBuffer = gl.createBuffer();
    if (!Cube.vertexBuffer) {
      console.log("Failed to create cube vertex buffer");
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    Cube.numVertices = 36;
    Cube.floatsPerVertex = 5;
  }

  render(gl, programInfo) {
    Cube.initBuffer(gl);

    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);

    const FSIZE = Float32Array.BYTES_PER_ELEMENT;

    gl.vertexAttribPointer(
      programInfo.a_Position,
      3,
      gl.FLOAT,
      false,
      Cube.floatsPerVertex * FSIZE,
      0
    );
    gl.enableVertexAttribArray(programInfo.a_Position);

    gl.vertexAttribPointer(
      programInfo.a_UV,
      2,
      gl.FLOAT,
      false,
      Cube.floatsPerVertex * FSIZE,
      3 * FSIZE
    );
    gl.enableVertexAttribArray(programInfo.a_UV);

    gl.uniformMatrix4fv(programInfo.u_ModelMatrix, false, this.matrix.elements);
    gl.uniform4f(
      programInfo.u_FragColor,
      this.color[0],
      this.color[1],
      this.color[2],
      this.color[3]
    );
    gl.uniform1i(programInfo.u_whichTexture, this.textureNum);
    gl.uniform1f(programInfo.u_texColorWeight, this.texColorWeight);

    gl.drawArrays(gl.TRIANGLES, 0, Cube.numVertices);
  }
}

Cube.vertexBuffer = null;
Cube.numVertices = 0;
Cube.floatsPerVertex = 5;