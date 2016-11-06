import ParsedGLTF from "./ParsedGLTF";
import TextFileResolver from "grimoirejs-fundamental/lib/Asset/TextFileResolver";
import GLTF from "./Schema/GLTF";
import Buffer from "grimoirejs-fundamental/lib/Resource/Buffer";
import Geometry from "grimoirejs-fundamental/lib/Geometry/Geometry";
import VertexBufferAttribInfo from "grimoirejs-fundamental/lib/Geometry/VertexBufferAttribInfo";
import IndexBufferInfo from "grimoirejs-fundamental/lib/Geometry/IndexBufferInfo";
import ImageResolver from "grimoirejs-fundamental/lib/Asset/ImageResolver";
import Texture2D from "grimoirejs-fundamental/lib/Resource/Texture2D";
export default class GLTFParser {
  public static async parseFromURL(gl: WebGLRenderingContext, url: string): Promise<ParsedGLTF> {
    const baseUrl = GLTFParser.getBaseDir(url);
    const resolved = (await TextFileResolver.resolve(url));
    const tf = JSON.parse(resolved);
    const rawArrayView: { [key: string]: ArrayBuffer } = {};
    const meshes = {};
    const buffers = {};
    const images = {};
    const textures = {};
    const materials = {};
    const accessors: { [key: string]: VertexBufferAttribInfo } = {};
    for (let key in tf.buffers) {
      rawArrayView[key] = await GLTFParser.bufferFromURL(tf, key, baseUrl);
    }
    for (let key in tf.bufferViews) {
      const bufferView = tf.bufferViews[key];
      const rawBuffer = rawArrayView[bufferView.buffer] as ArrayBuffer;
      const buffer = buffers[key] = new Buffer(gl, bufferView.target, WebGLRenderingContext.STATIC_DRAW);
      buffer.update(new DataView(rawBuffer, bufferView.byteOffset, bufferView.byteLength));
    }
    for (let key in tf.meshes) {
      meshes[key] = GLTFParser._parseMesh(tf, tf.meshes[key], buffers);
    }
    const imgLoadTask = [];
    for (let key in tf.images) {
      const imgKey = key;
      imgLoadTask.push(ImageResolver.resolve(baseUrl + tf.images[key].uri).then(t => {
        images[imgKey] = t;
      }));
    }
    await Promise.all(imgLoadTask);
    for (let key in tf.textures) {
      const texInfo = tf.textures[key];
      const tex = textures[key] = new Texture2D(gl);
      tex.update(images[texInfo.source]);
    }
    const scene = tf.scenes[tf.scene];
    for (let key in tf.materials) {
      const material = tf.materials[key];
      if (material.extensions !== void 0 && material.extensions.KHR_materials_common) {
        const commonMaterial = material.extensions.KHR_materials_common;
        materials[key] = {
          texture: commonMaterial.values.diffuse
        };
      } else {
        throw new Error("Unsupported material type");
      }
    }
    return {
      meshes: meshes,
      textures: textures,
      tf: tf,
      scene: scene,
      material: materials
    };
  }

  private static _parseMesh(tf: GLTF, meshInfo: any, buffers: { [key: string]: Buffer }): Geometry {
    const primitive = meshInfo.primitives[0];
    // construct index buffer
    const indexAccessor = tf.accessors[primitive.indices];
    const index = {} as IndexBufferInfo;
    index.topology = primitive.mode;
    index.type = indexAccessor.componentType;
    index.index = buffers[indexAccessor.bufferView];
    index.byteSize = GLTFParser._asByteSize(index.type);
    index.count = indexAccessor.count;
    // parse verticies
    const attribInfo = {} as { [key: string]: VertexBufferAttribInfo };
    const usedBuffers = {} as { [key: string]: Buffer };
    for (let attrib in primitive.attributes) {
      const grAttrib = GLTFParser._asGrAttribName(attrib);
      const accessor = tf.accessors[primitive.attributes[attrib]];
      usedBuffers[accessor.bufferView] = buffers[accessor.bufferView];
      attribInfo[GLTFParser._asGrAttribName(attrib)] = {
        bufferName: accessor.bufferView,
        size: GLTFParser._asVectorSize(accessor.type),
        type: accessor.componentType,
        stride: accessor.byteStride,
        offset: accessor.byteOffset
      };
    }
    const geometry = new Geometry(usedBuffers, attribInfo, { default: index });
    geometry["materialName"] = primitive.material; // TODO fix this bad implementation to find material from geometry
    return geometry;
  }

  private static _asColorValue(a: number[]): string {
    if (a.length === 3) {
      return `rgb(${(a[0] * 255).toFixed()},${(a[1] * 255).toFixed()},${(a[2] * 255).toFixed()}`;
    } else {
      return `rgb(${(a[0] * 255).toFixed()},${(a[1] * 255).toFixed()},${(a[2] * 255).toFixed()},${(a[3] * 255).toFixed()}`;
    }
  }

  private static _asVectorSize(type: string): number {
    switch (type) {
      case "SCALAR":
        return 1;
      case "VEC2":
        return 2;
      case "VEC3":
        return 3;
      case "VEC4":
        return 4;
      default:
        throw new Error("Invalid vectorSize");
    }
  }

  private static _asByteSize(indexType: number): number {
    switch (indexType) {
      case WebGLRenderingContext.UNSIGNED_BYTE:
        return 1;
      case WebGLRenderingContext.UNSIGNED_SHORT:
        return 2;
      case WebGLRenderingContext.UNSIGNED_INT:
        return 4;
      default:
        throw new Error("Unknown index size!");
    }
  }

  private static _asGrAttribName(bufferName: string): string {
    switch (bufferName) {
      case "POSITION":
        return "position";
      case "NORMAL":
        return "normal";
      case "TEXCOORD_0":
        return "texCoord";
    }
  }

  private static async bufferFromURL(tf: GLTF, bufferName: string, baseUrl: string): Promise<ArrayBuffer> {
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

  private static getBaseDir(url: string): string {
    return url.substr(0, url.lastIndexOf("/") + 1);
  }
}
