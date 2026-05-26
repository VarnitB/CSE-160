class Cube {
  constructor() {
    this.type = "cube";
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix4();

    this.textureNum = -1;
    this.texColorWeight = 1.0;
  }

  static initBuffer(gl) {
    if (Cube.vertexBuffer) return;

    const vertices = new Float32Array([
      // Front face
      0, 0, 1, 0, 0, 0, 0, 1,
      1, 0, 1, 1, 0, 0, 0, 1,
      1, 1, 1, 1, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 0, 0, 1,
      1, 1, 1, 1, 1, 0, 0, 1,
      0, 1, 1, 0, 1, 0, 0, 1,

      // Back face
      1, 0, 0, 0, 0, 0, 0, -1,
      0, 0, 0, 1, 0, 0, 0, -1,
      0, 1, 0, 1, 1, 0, 0, -1,
      1, 0, 0, 0, 0, 0, 0, -1,
      0, 1, 0, 1, 1, 0, 0, -1,
      1, 1, 0, 0, 1, 0, 0, -1,

      // Top face
      0, 1, 1, 0, 0, 0, 1, 0,
      1, 1, 1, 1, 0, 0, 1, 0,
      1, 1, 0, 1, 1, 0, 1, 0,
      0, 1, 1, 0, 0, 0, 1, 0,
      1, 1, 0, 1, 1, 0, 1, 0,
      0, 1, 0, 0, 1, 0, 1, 0,

      // Bottom face
      0, 0, 0, 0, 0, 0, -1, 0,
      1, 0, 0, 1, 0, 0, -1, 0,
      1, 0, 1, 1, 1, 0, -1, 0,
      0, 0, 0, 0, 0, 0, -1, 0,
      1, 0, 1, 1, 1, 0, -1, 0,
      0, 0, 1, 0, 1, 0, -1, 0,

      // Right face
      1, 0, 1, 0, 0, 1, 0, 0,
      1, 0, 0, 1, 0, 1, 0, 0,
      1, 1, 0, 1, 1, 1, 0, 0,
      1, 0, 1, 0, 0, 1, 0, 0,
      1, 1, 0, 1, 1, 1, 0, 0,
      1, 1, 1, 0, 1, 1, 0, 0,

      // Left face
      0, 0, 0, 0, 0, -1, 0, 0,
      0, 0, 1, 1, 0, -1, 0, 0,
      0, 1, 1, 1, 1, -1, 0, 0,
      0, 0, 0, 0, 0, -1, 0, 0,
      0, 1, 1, 1, 1, -1, 0, 0,
      0, 1, 0, 0, 1, -1, 0, 0,
    ]);

    Cube.vertexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    Cube.numVertices = 36;
    Cube.floatsPerVertex = 8;
  }

  render(gl, programInfo) {
    Cube.initBuffer(gl);

    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);

    const FSIZE = Float32Array.BYTES_PER_ELEMENT;
    const stride = Cube.floatsPerVertex * FSIZE;

    gl.vertexAttribPointer(programInfo.a_Position, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(programInfo.a_Position);

    gl.vertexAttribPointer(
      programInfo.a_UV,
      2,
      gl.FLOAT,
      false,
      stride,
      3 * FSIZE
    );
    gl.enableVertexAttribArray(programInfo.a_UV);

    gl.vertexAttribPointer(
      programInfo.a_Normal,
      3,
      gl.FLOAT,
      false,
      stride,
      5 * FSIZE
    );
    gl.enableVertexAttribArray(programInfo.a_Normal);

    this.normalMatrix.setInverseOf(this.matrix);
    this.normalMatrix.transpose();

    gl.uniformMatrix4fv(programInfo.u_ModelMatrix, false, this.matrix.elements);
    gl.uniformMatrix4fv(
      programInfo.u_NormalMatrix,
      false,
      this.normalMatrix.elements
    );

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
Cube.floatsPerVertex = 8;