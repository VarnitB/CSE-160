class Sphere {
  constructor(latitudeBands = 24, longitudeBands = 24) {
    this.type = "sphere";
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix4();

    this.textureNum = -1;
    this.texColorWeight = 0.0;

    this.latitudeBands = latitudeBands;
    this.longitudeBands = longitudeBands;

    this.vertexBuffer = null;
    this.numVertices = 0;

    this.generateVertices();
  }

  generateVertices() {
    const data = [];

    for (let lat = 0; lat < this.latitudeBands; lat++) {
      const theta1 = (lat * Math.PI) / this.latitudeBands;
      const theta2 = ((lat + 1) * Math.PI) / this.latitudeBands;

      for (let lon = 0; lon < this.longitudeBands; lon++) {
        const phi1 = (lon * 2 * Math.PI) / this.longitudeBands;
        const phi2 = ((lon + 1) * 2 * Math.PI) / this.longitudeBands;

        const p1 = this.getSpherePoint(theta1, phi1);
        const p2 = this.getSpherePoint(theta2, phi1);
        const p3 = this.getSpherePoint(theta2, phi2);
        const p4 = this.getSpherePoint(theta1, phi2);

        const uv1 = [lon / this.longitudeBands, lat / this.latitudeBands];
        const uv2 = [lon / this.longitudeBands, (lat + 1) / this.latitudeBands];
        const uv3 = [
          (lon + 1) / this.longitudeBands,
          (lat + 1) / this.latitudeBands,
        ];
        const uv4 = [(lon + 1) / this.longitudeBands, lat / this.latitudeBands];

        this.pushVertex(data, p1, uv1);
        this.pushVertex(data, p2, uv2);
        this.pushVertex(data, p3, uv3);

        this.pushVertex(data, p1, uv1);
        this.pushVertex(data, p3, uv3);
        this.pushVertex(data, p4, uv4);
      }
    }

    this.vertices = new Float32Array(data);
    this.numVertices = this.vertices.length / 8;
  }

  getSpherePoint(theta, phi) {
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.cos(theta);
    const z = Math.sin(theta) * Math.sin(phi);

    return [x, y, z];
  }

  pushVertex(data, position, uv) {
    const x = position[0];
    const y = position[1];
    const z = position[2];

    data.push(x, y, z);
    data.push(uv[0], uv[1]);

    data.push(x, y, z);
  }

  initBuffer(gl) {
    if (this.vertexBuffer) return;

    this.vertexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
  }

  render(gl, programInfo) {
    this.initBuffer(gl);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    const FSIZE = Float32Array.BYTES_PER_ELEMENT;
    const stride = 8 * FSIZE;

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

    gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
  }
}