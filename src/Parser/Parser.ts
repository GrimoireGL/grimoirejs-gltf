import GLTFMaterialsCommonParser from "./MaterialsCommonParser";
import GLTFConstantConverter from "./ConstantConverter";
import Vector3 from "grimoirejs-math/ref/Vector3";
import AABB from "grimoirejs-math/ref/AABB";
import ParsedGLTF from "./ParsedGLTF";
import TextFileResolver from "grimoirejs-fundamental/ref/Asset/TextFileResolver";
import GLTF from "./Schema/GLTF";
import Buffer from "grimoirejs-fundamental/ref/Resource/Buffer";
import Geometry from "grimoirejs-fundamental/ref/Geometry/Geometry";
import VertexBufferAttribInfo from "grimoirejs-fundamental/ref/Geometry/VertexBufferAttribInfo";
import IndexBufferInfo from "grimoirejs-fundamental/ref/Geometry/IndexBufferInfo";
import ImageResolver from "grimoirejs-fundamental/ref/Asset/ImageResolver";
import Texture2D from "grimoirejs-fundamental/ref/Resource/Texture2D";
export default class GLTFParser {
  public static async parseFromURL(gl: WebGLRenderingContext, url: string): Promise<ParsedGLTF> {
    const baseUrl = GLTFParser.getBaseDir(url);
    const resolved = (await TextFileResolver.resolve(url));
    const tf = JSON.parse(resolved) as GLTF;
    const rawBuffer: { [key: string]: ArrayBuffer } = {};
    const rawbufferView: { [key: string]: ArrayBuffer } = {};
    const meshes = {};
    const buffers = {};
    const images = {};
    const textures = {};
    const materials: { [key: string]: { type: string;[key: string]: any; } } = {};
    const accessors: { [key: string]: VertexBufferAttribInfo } = {};
    // constructing buffers
    for (let key in tf.buffers) {
      rawBuffer[key] = await GLTFParser.bufferFromURL(tf, key, baseUrl);
    }
    for (let key in tf.bufferViews) {
      const bufferView = tf.bufferViews[key];
      if (bufferView.target === void 0) {
        // skin or animation data
      } else {
        const currentBuffer = rawBuffer[bufferView.buffer];
        const buffer = buffers[key] = new Buffer(gl, bufferView.target, WebGLRenderingContext.STATIC_DRAW);
        rawbufferView[key] = currentBuffer.slice(bufferView.byteOffset, bufferView.byteOffset + bufferView.byteLength);
        buffer.update(rawbufferView[key]);

      }
    }
    // constructing meshes
    for (let key in tf.meshes) {
      meshes[key] = GLTFParser._parseMesh(gl, tf, key, buffers, rawbufferView);
    }
    // constructing textures
    const imgLoadTask = [];
    for (let key in tf.images) {
      if (GLTFParser.isDataUri(tf.images[key].uri)) {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        var image = new Image();
        image.src = tf.images[key].uri;;
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);
        images[key] = canvas;
      } else {
        imgLoadTask.push(ImageResolver.resolve(baseUrl + tf.images[key].uri).then(t => {
          images[key] = t;
        }));
      }
    }
    await Promise.all(imgLoadTask);
    for (let key in tf.textures) {
      const texInfo = tf.textures[key];
      const tex = textures[key] = new Texture2D(gl);
      tex.update(images[texInfo.source]);
    }
    for (let key in tf.materials) {
      const material = tf.materials[key];
      if (material.extensions !== void 0 && material.extensions.KHR_materials_common) {
        materials[key] = GLTFMaterialsCommonParser.parse(tf, key, baseUrl, textures);
      } else {
        console.warn("program is not parsed. Common material configuration are used alternatively");
        tf.materials[key].extensions = {};
        tf.materials[key].extensions.KHR_materials_common = {
          values: material.values,
          technique: "PHONG",
          transparent: true,
          jointCount: 0,
          doubleSided: true
        };
        materials[key] = GLTFMaterialsCommonParser.parse(tf, key, baseUrl, textures);
      }
    }
    return {
      meshes: meshes,
      textures: textures,
      tf: tf,
      materials: materials
    };
  }

  private static _parseMesh(gl: WebGLRenderingContext, tf: GLTF, meshName: string, buffers: { [key: string]: Buffer }, arrayBuffers: { [key: string]: ArrayBuffer }): Geometry {
    const meshInfo = tf.meshes[meshName];
    const primitive = meshInfo.primitives[0];
    const index = {} as IndexBufferInfo;
    index.topology = primitive.mode || WebGLRenderingContext.TRIANGLES;
    if (primitive.indices) {
      const indexAccessor = tf.accessors[primitive.indices];
      index.byteSize = GLTFConstantConverter.asByteSize(indexAccessor.componentType);
      // construct index buffer
      const baseBuffer = arrayBuffers[indexAccessor.bufferView];
      const typedArrCtor = GLTFConstantConverter.elementTypeToTypedArray(indexAccessor.componentType);
      const indexBufferSrc = new typedArrCtor(baseBuffer.slice(indexAccessor.byteOffset, indexAccessor.byteOffset + index.byteSize * indexAccessor.count));
      const indexBuffer = new Buffer(gl, WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, WebGLRenderingContext.STATIC_DRAW);
      indexBuffer.update(indexBufferSrc);
      index.type = indexAccessor.componentType;
      index.index = indexBuffer;
      index.byteOffset = 0;
      index.count = indexAccessor.count;
    } else {
      // should generate new index buffer for primitives
      const vertCount = tf.accessors[primitive.attributes["POSITION"]].count;
      const bufferInfo = GLTFConstantConverter.indexCountToBufferInfo(vertCount);
      index.type = bufferInfo.elementType;
      index.index = new Buffer(gl, WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, WebGLRenderingContext.STATIC_DRAW);
      index.byteSize = bufferInfo.byteSize;
      index.byteOffset = 0;
      index.count = vertCount;
      const array = new bufferInfo.ctor(index.count);
      for (var i = 0; i < index.count; i++) {
        array[i] = i;
      }
      index.index.update(array);
    }
    // parse verticies
    const attribInfo = {} as { [key: string]: VertexBufferAttribInfo };
    const usedBuffers = {} as { [key: string]: Buffer };
    let aabb;
    if (!primitive.attributes["TEXCOORD_0"]) { // needs generating texture buffer
      const posAttr = tf.accessors[primitive.attributes["POSITION"]];
      const uvBuf = new Buffer(gl, WebGLRenderingContext.ARRAY_BUFFER, WebGLRenderingContext.STATIC_DRAW);
      uvBuf.update(new Float32Array(new ArrayBuffer(8 * posAttr.count)));
      usedBuffers["@@UV"] = uvBuf;
      attribInfo["texCoord"] = {
        bufferName: "@@UV",
        size: 2,
        offset: 0,
        stride: 0,
        type: WebGLRenderingContext.FLOAT
      };
    }
    for (let attrib in primitive.attributes) {
      const grAttrib = GLTFConstantConverter.asGrAttribName(attrib);
      const accessor = tf.accessors[primitive.attributes[attrib]];
      usedBuffers[accessor.bufferView] = buffers[accessor.bufferView];
      if (attrib === "POSITION") {
        if (accessor.max && accessor.min) { // when the aabb can be constructed with min and max values.
          aabb = new AABB([new Vector3(accessor.max[0], accessor.max[1], accessor.max[2]), new Vector3(accessor.min[0], accessor.min[1], accessor.min[2])]);
        } else { // when the accessor does not contain min or max
          aabb = GLTFParser._genAABB(arrayBuffers[accessor.bufferView], accessor.byteStride, accessor.byteOffset, accessor.count);
        }
      }
      attribInfo[grAttrib] = {
        bufferName: accessor.bufferView,
        size: GLTFConstantConverter.asVectorSize(accessor.type),
        type: accessor.componentType,
        stride: accessor.byteStride,
        offset: accessor.byteOffset
      };
    }
    const geometry = new Geometry(usedBuffers, attribInfo, { default: index }, aabb);
    geometry["materialName"] = primitive.material; // TODO fix this bad implementation to find material from geometry
    return geometry;
  }

  private static bufferFromURL(tf: GLTF, bufferName: string, baseUrl: string): Promise<ArrayBuffer> {
    if (GLTFParser.isDataUri(tf.buffers[bufferName].uri)) {
      return new Promise((resolve, reject) => {
        resolve(GLTFParser.dataUriToArrayBuffer(tf.buffers[bufferName].uri));
      });
    }
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", baseUrl + tf.buffers[bufferName].uri);
      xhr.responseType = "arraybuffer";
      xhr.onload = (v) => {
        resolve(xhr.response);
      };
      xhr.onerror = (e) => {
        reject(e);
      };
      xhr.send();
    });
  }

  private static _genAABB(view: ArrayBuffer, stride: number, offset: number, count: number): AABB {
    const aabb = new AABB();
    const dView = new DataView(view);
    for (var i = offset; i < offset + (count - 1) * stride; i += stride) {
      aabb.expand(new Vector3(dView.getFloat32(i, true), dView.getFloat32(i + 4, true), dView.getFloat32(i + 8, true)));
    }
    return aabb;
  }

  private static isDataUri(dataUri: string): boolean {
    return !!dataUri.match(/^\s*data\:.*;base64/);
  }

  private static dataUriToArrayBuffer(dataUri: string): ArrayBuffer {
    const splittedUri = dataUri.split(",");
    const byteString = atob(splittedUri[1]);
    const byteStringLength = byteString.length;
    const arrayBuffer = new ArrayBuffer(byteStringLength);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteStringLength; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    return arrayBuffer;
  }

  private static getBaseDir(url: string): string {
    return url.substr(0, url.lastIndexOf("/") + 1);
  }
}
