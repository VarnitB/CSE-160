// Cube.js

class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
  }

  static initBuffer() {
    if (Cube.vertexBuffer) return;

    const vertices = new Float32Array([
      // Front
      0,0,0,  1,1,0,  1,0,0,
      0,0,0,  0,1,0,  1,1,0,

      // Back
      0,0,1,  1,0,1,  1,1,1,
      0,0,1,  1,1,1,  0,1,1,

      // Top
      0,1,0,  0,1,1,  1,1,1,
      0,1,0,  1,1,1,  1,1,0,

      // Bottom
      0,0,0,  1,0,1,  0,0,1,
      0,0,0,  1,0,0,  1,0,1,

      // Left
      0,0,0,  0,0,1,  0,1,1,
      0,0,0,  0,1,1,  0,1,0,

      // Right
      1,0,0,  1,1,1,  1,0,1,
      1,0,0,  1,1,0,  1,1,1
    ]);

    Cube.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  }

  render() {
    Cube.initBuffer();

    const rgba = this.color;

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
}

Cube.vertexBuffer = null;