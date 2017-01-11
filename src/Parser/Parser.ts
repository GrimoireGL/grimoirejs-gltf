<<<<<<< HEAD
import ResourceResolver from "../Util/ResourceResolver";
=======
import Program from "grimoirejs-fundamental/ref/Resource/Program";
import ResourceResolver from "./ResourceResolver";
import Shader from "grimoirejs-fundamental/ref/Resource/Shader";
>>>>>>> 131f15060617e43d5780407ef8492899d0c1ce60
import Accessor from "../Accessor/Accessor";
import Matrix from "grimoirejs-math/ref/Matrix";
import Animation from "../Animation/Animation";
import MaterialParser from "./MaterialParser";
import GLTFConstantConverter from "./ConstantConverter";
import Vector3 from "grimoirejs-math/ref/Vector3";
import AABB from "grimoirejs-math/ref/AABB";
import ParsedGLTF from "./ParsedGLTF";
import TextFileResolver from "grimoirejs-fundamental/ref/Asset/TextFileResolver";
import GLTF from "./Schema/GLTF";
import Buffer from "grimoirejs-fundamental/ref/Resource/Buffer";
import Geometry from "grimoirejs-fundamental/ref/Geometry/Geometry";
import VertexBufferAccessor from "grimoirejs-fundamental/ref/Geometry/VertexBufferAccessor";
import IndexBufferInfo from "grimoirejs-fundamental/ref/Geometry/IndexBufferInfo";
import ImageResolver from "grimoirejs-fundamental/ref/Asset/ImageResolver";
import Texture2D from "grimoirejs-fundamental/ref/Resource/Texture2D";
export default class GLTFParser {
<<<<<<< HEAD
  public static async parseFromURL(gl: WebGLRenderingContext, url: string): Promise<ParsedGLTF> {
    const resourceResolver = new ResourceResolver(url);
    const resolved = (await TextFileResolver.resolve(url));
    const tf = JSON.parse(resolved) as GLTF;
    const rawBuffer: { [key: string]: ArrayBuffer } = {};
    const rawbufferView: { [key: string]: ArrayBufferView } = {};
    const meshes = {};
    const buffers = {};
    const images = {};
    const textures = {};
    const animations = {};
    const skins = {};
    const materials: { [key: string]: { [key: string]: any; } } = {};
    const accessors: { [key: string]: VertexBufferAccessor } = {};
    // constructing buffers
    for (let key in tf.buffers) {
      rawBuffer[key] = await resourceResolver.loadBuffer(tf.buffers[key].uri);
    }
    for (let key in tf.bufferViews) {
      const bufferView = tf.bufferViews[key];
      const currentBuffer = rawBuffer[bufferView.buffer];
      rawbufferView[key] = new Uint8Array(currentBuffer, bufferView.byteOffset, bufferView.byteLength);
      if (bufferView.target === void 0) {
        // skin or animation data

      } else {
        const buffer = buffers[key] = new Buffer(gl, bufferView.target, WebGLRenderingContext.STATIC_DRAW);
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
        imgLoadTask.push(resourceResolver.loadImage(tf.images[key].uri).then(t=>{
          images[key] = t;
        }));
    }
    await Promise.all(imgLoadTask);
    // parse textures
    for (let key in tf.textures) {
      const texInfo = tf.textures[key];
      const sampler = tf.samplers[texInfo.sampler];
      const tex = textures[key] = new Texture2D(gl);
      tex.magFilter = sampler.magFilter || WebGLRenderingContext.LINEAR;
      tex.minFilter = sampler.minFilter || WebGLRenderingContext.NEAREST_MIPMAP_LINEAR;
      tex.wrapS = sampler.wrapS || WebGLRenderingContext.REPEAT;
      tex.wrapT = sampler.wrapT || WebGLRenderingContext.REPEAT;
      tex.update(images[texInfo.source]);
    }
    for (let key in tf.materials) {
      const material = tf.materials[key];
      if (material.extensions !== void 0 && material.extensions.KHR_materials_common) {
        materials[key] =await MaterialParser.parse(tf, key, resourceResolver, textures);
      } else {
        materials[key] =await MaterialParser.parse(tf, key, resourceResolver, textures);
      }
    }
    // parse animations
    if (tf.animations) {
      for (let key in tf.animations) {
        animations[key] = new Animation(tf, key, rawbufferView);
      }
    }
    if (tf.skins) {
      for (let key in tf.skins) {
        const skin = tf.skins[key];
        const accessor = tf.accessors[skin.inverseBindMatrices];
        skins[key] = {
          bindShapeMatrix: new Matrix(skin.bindShapeMatrix),
          jointNames: skin.jointNames,
          inverseBindMatrices: new Accessor(rawbufferView[accessor.bufferView], accessor.count, accessor.componentType, GLTFConstantConverter.asVectorSize(accessor.type), accessor.byteOffset || 0, accessor.byteStride || 0),
          jointMatrices: new Float32Array(16 * skin.jointNames.length)
=======
    public static async parseFromURL(gl: WebGLRenderingContext, url: string): Promise<ParsedGLTF> {
        const resourceResolver = new ResourceResolver(url);
        const resolved = (await TextFileResolver.resolve(url));
        const tf = JSON.parse(resolved) as GLTF;
        const rawBuffer: { [key: string]: ArrayBuffer } = {};
        const rawbufferView: { [key: string]: ArrayBufferView } = {};
        const meshes = {};
        const buffers = {};
        const images = {};
        const textures = {};
        const animations = {};
        const shaders = {};
        const skins = {};
        const programs = {};
        const materials: { [key: string]: { type: string;[key: string]: any; } } = {};
        const accessors: { [key: string]: VertexBufferAttribInfo } = {};
        // constructing buffers
        for (let key in tf.buffers) {
            rawBuffer[key] = await resourceResolver.fetchBinary(tf.buffers[key].uri);
        }
        for (let key in tf.bufferViews) {
            const bufferView = tf.bufferViews[key];
            const currentBuffer = rawBuffer[bufferView.buffer];
            rawbufferView[key] = new Uint8Array(currentBuffer, bufferView.byteOffset, bufferView.byteLength);
            if (bufferView.target === void 0) {
                // skin or animation data

            } else {
                const buffer = buffers[key] = new Buffer(gl, bufferView.target, WebGLRenderingContext.STATIC_DRAW);
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
            imgLoadTask.push(resourceResolver.fetchImage(tf.images[key].uri).then(t => {
                images[key] = t;
            }));
        }
        await Promise.all(imgLoadTask);
        for (let key in tf.textures) {
            const texInfo = tf.textures[key];
            const sampler = tf.samplers[texInfo.sampler];
            const tex = textures[key] = new Texture2D(gl);
            tex.magFilter = sampler.magFilter || WebGLRenderingContext.LINEAR;
            tex.minFilter = sampler.minFilter || WebGLRenderingContext.NEAREST_MIPMAP_LINEAR;
            tex.wrapS = sampler.wrapS || WebGLRenderingContext.REPEAT;
            tex.wrapT = sampler.wrapT || WebGLRenderingContext.REPEAT;
            tex.update(images[texInfo.source]);
        }
        const shaderLoadTasks = [];
        // parse shaders
        for (let key in tf.shaders) {
            const shaderInfo = tf.shaders[key];
            shaderLoadTasks.push(resourceResolver.fetchText(shaderInfo.uri).then(s => {
                const shader = new Shader(gl, shaderInfo.type);
                shader.update(s);
                shaders[key] = shader;
            }));
        }
        await Promise.all(shaderLoadTasks);
        // parse programs
        for (let key in tf.programs) {
            const programInfo = tf.programs[key];
            const program = programs[key] = new Program(gl);
            program.update([shaders[programInfo.vertexShader], shaders[programInfo.fragmentShader]]);
        }
        for (let key in tf.materials) {
            const material = tf.materials[key];
            if (material.extensions !== void 0 && material.extensions.KHR_materials_common) {
                materials[key] = GLTFMaterialsCommonParser.parse(tf, key, textures);
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
                materials[key] = GLTFMaterialsCommonParser.parse(tf, key, textures);
            }
        }
        // parse animations
        if (tf.animations) {
            for (let key in tf.animations) {
                animations[key] = new Animation(tf, key, rawbufferView);
            }
        }
        if (tf.skins) {
            for (let key in tf.skins) {
                const skin = tf.skins[key];
                const accessor = tf.accessors[skin.inverseBindMatrices];
                skins[key] = {
                    bindShapeMatrix: new Matrix(skin.bindShapeMatrix),
                    jointNames: skin.jointNames,
                    inverseBindMatrices: new Accessor(rawbufferView[accessor.bufferView], accessor.count, accessor.componentType, GLTFConstantConverter.asVectorSize(accessor.type), accessor.byteOffset || 0, accessor.byteStride || 0),
                    jointMatrices: new Float32Array(16 * skin.jointNames.length)
                };
            }
        }
        return {
            meshes: meshes,
            textures: textures,
            tf: tf,
            materials: materials,
            animations: animations,
            skins: skins
>>>>>>> 131f15060617e43d5780407ef8492899d0c1ce60
        };
      }
    }
    return {
      meshes: meshes,
      textures: textures,
      tf: tf,
      materials: materials,
      animations: animations,
      skins: skins
    };
  }

  private static _parseMesh(gl: WebGLRenderingContext, tf: GLTF, meshName: string, buffers: { [key: string]: Buffer }, arrayBuffers: { [key: string]: ArrayBufferView }): Geometry[] {
    const meshInfo = tf.meshes[meshName];
    const geometries: Geometry[] = [];
    for (let p = 0; p < meshInfo.primitives.length; p++) {
      const geometry = new Geometry(gl);
      const primitive = meshInfo.primitives[p];
      const topology = primitive.mode || WebGLRenderingContext.TRIANGLES;
      if (primitive.indices) {
        const indexAccessor = tf.accessors[primitive.indices];
        // construct index buffer
        const baseBuffer = arrayBuffers[indexAccessor.bufferView];
        const typedArrCtor = GLTFConstantConverter.elementTypeToTypedArray(indexAccessor.componentType);
        const indexBufferSrc = new typedArrCtor(baseBuffer.buffer, indexAccessor.byteOffset + baseBuffer.byteOffset);
        const iBuf = new Buffer(gl, WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, WebGLRenderingContext.STATIC_DRAW);
        iBuf.update(indexBufferSrc);
        geometry.addIndex("default",iBuf,topology,0,indexAccessor.count,indexAccessor.componentType);
      } else {
        // should generate new index buffer for primitives
        const vertCount = tf.accessors[primitive.attributes["POSITION"]].count;
        const bufferInfo = GLTFConstantConverter.indexCountToBufferInfo(vertCount);
        const ibuf =  new Buffer(gl, WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, WebGLRenderingContext.STATIC_DRAW);
        const array = new bufferInfo.ctor(vertCount);
        for (var i = 0; i < vertCount; i++) {
          array[i] = i;
        }
        ibuf.update(array);
        geometry.addIndex("default",ibuf,topology,0,vertCount,bufferInfo.elementType);
      }
      // parse verticies
      const attribInfo = {} as { [key: string]: VertexBufferAccessor };
      const usedBuffers = {} as { [key: string]: Buffer };
      let aabb;
      if (!primitive.attributes["TEXCOORD_0"]) { // needs generating texture buffer
        const posAttr = tf.accessors[primitive.attributes["POSITION"]];
        const uvBuf = new Buffer(gl, WebGLRenderingContext.ARRAY_BUFFER, WebGLRenderingContext.STATIC_DRAW);
        uvBuf.update(new Float32Array(new ArrayBuffer(8 * posAttr.count)));
        usedBuffers["@@UV"] = uvBuf;
        geometry.addAttributes(uvBuf,{
          TEXCOORD_0:{
            size:2
          }
        });
      }

      for (let attrib in primitive.attributes) {
        const accessor = tf.accessors[primitive.attributes[attrib]];
        usedBuffers[accessor.bufferView] = buffers[accessor.bufferView];
        if (attrib === "POSITION") {
          if (accessor.max && accessor.min) { // when the aabb can be constructed with min and max values.
            aabb = new AABB([new Vector3(accessor.max[0], accessor.max[1], accessor.max[2]), new Vector3(accessor.min[0], accessor.min[1], accessor.min[2])]);
          } else { // when the accessor does not contain min or max
            aabb = GLTFParser._genAABB(arrayBuffers[accessor.bufferView], accessor.byteStride, accessor.byteOffset, accessor.count);
          }
        }
        const bufAccessor = {};
        bufAccessor[attrib] = {
          size: GLTFConstantConverter.asVectorSize(accessor.type),
          type: accessor.componentType,
          stride: accessor.byteStride,
          offset: accessor.byteOffset
        };
        geometry.addAttributes(buffers[accessor.bufferView],bufAccessor);
      }
      geometry["materialName"] = primitive.material; // TODO fix this bad implementation to find material from geometry
      geometries.push(geometry);
    }
    return geometries;
  }

  private static _genAABB(view: ArrayBufferView, stride: number, offset: number, count: number): AABB {
    const aabb = new AABB();
    const dView = new Float32Array(view.buffer, view.byteOffset);
    for (var i = offset; i < offset + (count - 1) * stride; i += stride) {
      aabb.expand(new Vector3(dView[i], dView[i + 1], dView[i + 2]));
    }
    return aabb;
  }
}
