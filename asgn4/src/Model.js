class Model {
  constructor(filePath) {
    this.filePath = filePath;

    this.color = [0.9, 0.8, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix4();

    this.textureNum = -1;
    this.texColorWeight = 0.0;

    this.vertices = null;
    this.vertexBuffer = null;
    this.numVertices = 0;
    this.loaded = false;
  }

  async load() {
    try {
      const response = await fetch(this.filePath);

      if (!response.ok) {
        throw new Error("Could not load OBJ file.");
      }

      const text = await response.text();

      this.parseOBJ(text);
      this.loaded = true;
    } catch (error) {
      console.log("OBJ load failed. Using fallback model.", error);

      this.createFallbackModel();
      this.loaded = true;
    }
  }

  parseOBJ(text) {
    const positions = [];
    const normals = [];
    const uvs = [];
    const output = [];

    const lines = text.split("\n");

    for (let line of lines) {
      line = line.trim();

      if (line.length === 0 || line.startsWith("#")) {
        continue;
      }

      const parts = line.split(/\s+/);
      const keyword = parts[0];

      if (keyword === "v") {
        positions.push([
          parseFloat(parts[1]),
          parseFloat(parts[2]),
          parseFloat(parts[3]),
        ]);
      } else if (keyword === "vn") {
        normals.push([
          parseFloat(parts[1]),
          parseFloat(parts[2]),
          parseFloat(parts[3]),
        ]);
      } else if (keyword === "vt") {
        uvs.push([parseFloat(parts[1]), parseFloat(parts[2])]);
      } else if (keyword === "f") {
        const face = parts.slice(1);

        for (let i = 1; i < face.length - 1; i++) {
          this.addOBJTriangle(
            face[0],
            face[i],
            face[i + 1],
            positions,
            uvs,
            normals,
            output
          );
        }
      }
    }

    this.vertices = new Float32Array(output);
    this.numVertices = this.vertices.length / 8;
  }

  addOBJTriangle(a, b, c, positions, uvs, normals, output) {
    const refs = [a, b, c].map((token) => this.parseFaceToken(token));

    const p0 = positions[refs[0].v];
    const p1 = positions[refs[1].v];
    const p2 = positions[refs[2].v];

    const fallbackNormal = this.calculateFaceNormal(p0, p1, p2);

    for (let i = 0; i < 3; i++) {
      const ref = refs[i];

      const p = positions[ref.v] || [0, 0, 0];
      const uv = ref.vt >= 0 && uvs[ref.vt] ? uvs[ref.vt] : [0, 0];
      const n = ref.vn >= 0 && normals[ref.vn] ? normals[ref.vn] : fallbackNormal;

      output.push(p[0], p[1], p[2]);
      output.push(uv[0], uv[1]);
      output.push(n[0], n[1], n[2]);
    }
  }

  parseFaceToken(token) {
    const parts = token.split("/");

    const v = parseInt(parts[0]) - 1;
    const vt = parts[1] ? parseInt(parts[1]) - 1 : -1;
    const vn = parts[2] ? parseInt(parts[2]) - 1 : -1;

    return { v, vt, vn };
  }

  calculateFaceNormal(p0, p1, p2) {
    const ux = p1[0] - p0[0];
    const uy = p1[1] - p0[1];
    const uz = p1[2] - p0[2];

    const vx = p2[0] - p0[0];
    const vy = p2[1] - p0[1];
    const vz = p2[2] - p0[2];

    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;

    const length = Math.sqrt(nx * nx + ny * ny + nz * nz);

    if (length === 0) {
      return [0, 1, 0];
    }

    nx /= length;
    ny /= length;
    nz /= length;

    return [nx, ny, nz];
  }

  createFallbackModel() {
    const output = [];

    const positions = [
      [0, 1.5, 0],
      [-1, 0, -1],
      [1, 0, -1],
      [1, 0, 1],
      [-1, 0, 1],
      [0, -0.8, 0],
    ];

    const faces = [
      [0, 1, 2],
      [0, 2, 3],
      [0, 3, 4],
      [0, 4, 1],
      [5, 2, 1],
      [5, 3, 2],
      [5, 4, 3],
      [5, 1, 4],
    ];

    for (let f of faces) {
      const p0 = positions[f[0]];
      const p1 = positions[f[1]];
      const p2 = positions[f[2]];
      const n = this.calculateFaceNormal(p0, p1, p2);

      for (let index of f) {
        const p = positions[index];

        output.push(p[0], p[1], p[2]);
        output.push(0, 0);
        output.push(n[0], n[1], n[2]);
      }
    }

    this.vertices = new Float32Array(output);
    this.numVertices = this.vertices.length / 8;
  }

  initBuffer(gl) {
    if (this.vertexBuffer || !this.vertices) return;

    this.vertexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
  }

  render(gl, programInfo) {
    if (!this.loaded || !this.vertices) return;

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