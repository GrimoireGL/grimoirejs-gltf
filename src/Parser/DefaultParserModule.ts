import ParserModule from "./ParserModule";
import GLTF from "./Schema/GLTF";
import GLTFImage from "./Schema/GLTFImage";
import GLTFBuffer from "./Schema/GLTFBuffer";
import GLTFMaterial from "./Schema/GLTFMaterial";
import GLTFSampler from "./Schema/GLTFSampler";
import GLTFAnimation from "./Schema/GLTFAnimation";
import ConstantConverter from "./ConstantConverter";

import Texture2D from "grimoirejs-fundamental/ref/Resource/Texture2D";
import Geometry from "grimoirejs-fundamental/ref/Geometry/Geometry";
import MorphGeometry from "grimoirejs-fundamental/ref/Geometry/MorphGeometry";
import MorphParameter from "grimoirejs-fundamental/ref/Geometry/MorphParameter";
import Material from "grimoirejs-fundamental/ref/Material/Material";
import MaterialFactory from "grimoirejs-fundamental/ref/Material/MaterialFactory";
import Quaternion from "grimoirejs-math/ref/Quaternion";
import GLTFConstantConverter from "./ConstantConverter";
import IAnimationRecipe from "grimoirejs-animation/ref/Animation/Schema/IAnimationRecipe";
import IAnimationTimeline from "grimoirejs-animation/ref/Animation/Schema/IAnimationTimeline";
import TextureReference from "grimoirejs-fundamental/ref/Material/TextureReference";
import VertexBufferAccessor from "grimoirejs-fundamental/ref/Geometry/VertexBufferAccessor";
import Vector3 from "grimoirejs-math/ref/Vector3";

import { ConvertToTextureArgument, LoadBufferViewsArgument, LoadPrimitivesOfMeshArgument, LoadPrimitiveArgument, AppendIndicesArgument, AddVertexAttributesArgument } from "./Arguments";

export default class DefaultParserModule extends ParserModule {

  public fetchGLTF(url: string): Promise<ArrayBuffer> {
    return this.__fetchBuffer(url);
  }

  public loadAsGLTF(buffer: ArrayBuffer): GLTF {
    const rawStr = this.__bufferToString(buffer);
    return JSON.parse(rawStr) as GLTF;
  }

  public async loadTextureResources(tf: GLTF): Promise<{ [key: string]: Texture2D }> {
    const textures: { [key: number]: Texture2D } = {};
    const promises = [];
    if (tf.images) {
      for (let key in tf.textures) {
        const texture = tf.textures[key];
        const promise = this.parser.callParserModule(t => t.fetchTextureResource, tf.images[texture.source])
          .then(img => {
            const texture = this.parser.callParserModule(t => t.convertTotexture, { tf: tf, image: img, texIndex: key });
            textures[key] = texture;
          });
        promises.push(promise);
      }
    }
    await Promise.all(promises);
    return textures;
  }

  /**
   * Start loading texture resource.
   * @return {Promise<Texture2D>} [description]
   */
  public fetchTextureResource(tf: GLTFImage): Promise<HTMLImageElement> {
    return this.__fetchImage(this.baseDirectory + tf.uri);
  }

  /**
   * Load image as texture
   * @return {Promise<Texture2D>} [description]
   */
  public convertTotexture(arg: ConvertToTextureArgument): Texture2D {
    const tex = new Texture2D(this.__gl);
    tex.update(arg.image);
    const texInfo = arg.tf.textures[arg.texIndex];
    let samplerInfo = {} as GLTFSampler;
    if (texInfo && texInfo.sampler !== void 0) {
      samplerInfo = arg.tf.samplers[texInfo.sampler];
    }
    tex.magFilter = samplerInfo.magFilter || WebGLRenderingContext.LINEAR;
    tex.minFilter = samplerInfo.minFilter || WebGLRenderingContext.NEAREST_MIPMAP_LINEAR;
    tex.wrapS = samplerInfo.wrapS || WebGLRenderingContext.REPEAT;
    tex.wrapT = samplerInfo.wrapT || WebGLRenderingContext.REPEAT;
    return tex;
  }

  /**
   * Start loading buffer resource.
   * @return {Promise<ArrayBuffer>} [description]
   */
  public loadBufferResource(tf: GLTFBuffer): Promise<ArrayBuffer> {
    return this.__fetchBuffer(this.baseDirectory + tf.uri);
  }

  public async loadBufferResources(tf: GLTF): Promise<{ [key: string]: ArrayBuffer }> {
    const buffers: { [key: number]: ArrayBuffer } = {};
    const promises = [];
    for (let key in tf.buffers) {
      promises.push(
        this.parser.callParserModule(t => t.loadBufferResource, tf.buffers[key]).then(
          buffer => {
            buffers[key] = buffer;
          }
        )
      );
    }
    await Promise.all(promises);
    return buffers;
  }

  public loadBufferViews(args: LoadBufferViewsArgument): { [key: string]: ArrayBufferView } {
    const bufferViews: { [key: string]: ArrayBufferView } = {};
    for (let key in args.tf.bufferViews) {
      const bufferViewInfo = args.tf.bufferViews[key];
      if (bufferViewInfo.byteOffset === void 0) {
        bufferViewInfo.byteOffset = 0;
      }
      bufferViews[key] = new Uint8Array(args.buffers[bufferViewInfo.buffer], bufferViewInfo.byteOffset, bufferViewInfo.byteLength);
    }
    return bufferViews;
  }

  public loadPrimitivesOfMesh(args: LoadPrimitivesOfMeshArgument): { [key: string]: Geometry[] } {
    const result: { [key: string]: Geometry[] } = {};
    for (let key in args.tf.meshes) {
      const meshInfo = args.tf.meshes[key];
      const primitives = [];
      result[key] = primitives;
      for (let pKey in meshInfo.primitives) {
        primitives.push(this.parser.callParserModule(t => t.loadPrimitive, { tf: args.tf, bufferViews: args.bufferViews, primitive: meshInfo.primitives[pKey] }));
      }
    }
    return result;
  }

  public loadPrimitive(args: LoadPrimitiveArgument): Geometry {
    const geo = args.primitive.targets === void 0 ? new Geometry(this.__gl) : new MorphGeometry(this.__gl);
    this.parser.callParserModule(t => t.appendIndices, { tf: args.tf, bufferViews: args.bufferViews, primitive: args.primitive, geometry: geo });
    this.parser.callParserModule(t => t.addVertexAttributes, { tf: args.tf, bufferViews: args.bufferViews, primitive: args.primitive, geometry: geo });
    return geo;
  }

  public appendIndices(args: AppendIndicesArgument): boolean {
    if (args.primitive.indices !== void 0) {
      const topology = args.primitive.mode || WebGLRenderingContext.TRIANGLES;
      const indexAccessor = args.tf.accessors[args.primitive.indices];
      args.geometry.addIndex("default", args.bufferViews[indexAccessor.bufferView], topology, indexAccessor.byteOffset, indexAccessor.count, indexAccessor.componentType);
      return true;
    }
  }

  public addVertexAttributes(args: AddVertexAttributesArgument): boolean {
    for (let attrib in args.primitive.attributes) {
      const primitive = args.primitive;
      const accessor = args.tf.accessors[primitive.attributes[attrib]];
      const bufferViewInfo = args.tf.bufferViews[accessor.bufferView];
      const bufAccessor = {} as { [key: string]: VertexBufferAccessor };
      const elementSize = GLTFConstantConverter.asVectorSize(accessor.type);
      // Check morph used. If morph was used for spcified attribute, source of the buffer should be keeped for using later.
      let useMorphing = false;
      if (primitive.targets && primitive.targets.length >= 1) {
        for (let target of primitive.targets) {
          if (attrib in target) {
            useMorphing = true;
            break;
          }
        }
      }
      bufAccessor[attrib] = {
        size: elementSize,
        type: accessor.componentType,
        stride: bufferViewInfo.byteStride,
        offset: 0,
        keepOnBuffer: useMorphing
      };
      const bufferView = args.bufferViews[accessor.bufferView];
      const ctor = ConstantConverter.asTypedArrayConstructor(accessor.componentType);
      const convertedBuffer = this.__convertBufferView(ctor, bufferView, bufferViewInfo, accessor);
      args.geometry.addAttributes(convertedBuffer, bufAccessor);
      if (attrib === "POSITION") {
        let stride = bufferViewInfo.byteStride / 4;
        if (isNaN(stride)) {
          stride = 3;//ConstantConverter.asVectorSize(accessor.type) / ConstantConverter.asByteSize(accessor.componentType);
        }
        for (let j = 0; j < accessor.count; j++) {
          let first = j * stride;
          args.geometry.aabb.expand(new Vector3(convertedBuffer[first], convertedBuffer[first + 1], convertedBuffer[first + 2]))
        }
      }
      if (args.primitive.targets !== void 0 && args.primitive.targets[0][attrib] !== void 0) {
        // This attribute has morph
        const geometry = args.geometry as MorphGeometry;
        let parameters = [] as MorphParameter[];
        const targets = args.primitive.targets;
        for (let i = 0; i < targets.length; i++) {
          const accessor = args.tf.accessors[targets[i][attrib]];
          const bufferViewInfo = args.tf.bufferViews[accessor.bufferView];
          const buffer = args.bufferViews[accessor.bufferView];
          const morphBuffer = this.__convertBufferView(Float32Array, buffer, bufferViewInfo, accessor);
          parameters.push({
            buffer: morphBuffer,
            accessor: {
              size: GLTFConstantConverter.asVectorSize(accessor.type),
              stride: bufferViewInfo.byteStride,
              offset: 0
            }
          });
        }
        geometry.addMorphAttribute(attrib, parameters);
      }
    }
    this.parser.callParserModule(t => t.complementVertexAttributes, args);
    return true;
  }

  public complementVertexAttributes(args: AddVertexAttributesArgument): boolean {
    return true;
  }

  public async loadMaterials(args: { tf: GLTF, textures: { [key: string]: Texture2D } }): Promise<{ [key: string]: Material }> {
    const result: { [key: string]: Material } = {};
    for (let key in args.tf.materials) {
      result[key] = await this.parser.callParserModule(t => t.loadMaterial, { material: args.tf.materials[key], textures: args.textures });
    }
    return result;
  }

  public async loadMaterial(args: { material: GLTFMaterial, textures: { [key: string]: Texture2D } }): Promise<Material> {
    if (args.material["pbrMetallicRoughness"]) {
      const material = await MaterialFactory.get(this.__gl).instanciate("gltf-pbr-metallic-roughness");
      const pmr = args.material["pbrMetallicRoughness"];
      const pass = material.techniques["default"].passes[0];
      if (pmr.baseColorFactor) {
        pass.setArgument("baseColorFactor", pmr.baseColorFactor, null);
      }
      if (pmr.baseColorTexture) {
        pass.setArgument("baseColorTexture", new TextureReference(args.textures[pmr.baseColorTexture.index]), null);
      }
      if (pmr.metallicFactor) {
        pass.setArgument("metallicFactor", pmr.metallicFactor, null);
      }
      // TODO Remove? metallicTexture and roughnessTexture was removed from specification?
      if ((pmr as any).metallicTexture) {
        pass.setArgument("metallicTexture", new TextureReference(args.textures[(pmr as any).metallicTexture.index]), null);
      }
      if ((pmr as any).roughnessTexture) {
        pass.setArgument("roughnessTexture", new TextureReference(args.textures[(pmr as any).roughnessTexture.index]), null);
      }
      if (pmr.roughnessFactor) {
        pass.setArgument("roughnessFactor", pmr.roughnessFactor, null);
      }
      if (pmr.metallicRoughnessTexture) {
        pass.setArgument("metallicRoughnessTexture", new TextureReference(args.textures[pmr.metallicRoughnessTexture.index]), null);
      }
      if (args.material["emissiveFactor"]) {
        pass.setArgument("emissiveFactor", args.material.emissiveFactor, null);
      }
      if (args.material["emissiveTexture"]) {
        pass.setArgument("emissiveTexture", new TextureReference(args.textures[args.material.emissiveTexture.index]), null);
      }
      if (args.material["normalTexture"]) {
        pass.setArgument("normalTexture", new TextureReference(args.textures[args.material.normalTexture.index]), null);
      }
      if (args.material["occlusionTexture"]) {
        pass.setArgument("occlusionTexture", new TextureReference(args.textures[args.material.occlusionTexture.index]), null);
      }
      return material;
    }
  }

  public loadAnimations(args: { tf: GLTF, bufferViews: { [key: string]: ArrayBufferView } }): { [key: string]: IAnimationRecipe } {
    const result: { [key: string]: IAnimationRecipe } = {};
    for (let key in args.tf.animations) {
      const animation = args.tf.animations[key];
      result[key] = this.parser.callParserModule(m => m.loadAnimation, { tf: args.tf, bufferViews: args.bufferViews, animation: animation })
    }
    return result;
  }

  public loadAnimation(args: { tf: GLTF, bufferViews: { [key: string]: ArrayBufferView }, animation: GLTFAnimation }): IAnimationRecipe {
    const defaultClip: IAnimationTimeline[] = [];
    for (let i = 0; i < args.animation.channels.length; i++) {
      let clip: IAnimationTimeline = {} as IAnimationTimeline;
      const channel = args.animation.channels[i];
      const query = ".gltf-node-" + channel.target.node;
      const target = this._pathNameToGrimoire(channel.target.path);
      const sampler = args.animation.samplers[channel.sampler];
      clip.query = query;
      clip.component = target.component;
      clip.attribute = target.attributeName;
      const inputAccessor = args.tf.accessors[sampler.input];
      const outputAccessor = args.tf.accessors[sampler.output];
      const inputBufferInfo = args.tf.bufferViews[inputAccessor.bufferView];
      const inputBuffer = args.bufferViews[inputAccessor.bufferView];
      const outputBuffer = args.bufferViews[outputAccessor.bufferView];
      const outputBufferInfo = args.tf.bufferViews[outputAccessor.bufferView];
      const inputBufferF32 = this.__convertBufferView(Float32Array, inputBuffer, inputBufferInfo, inputAccessor);//new Float32Array(inputBuffer.buffer, inputBuffer.byteOffset + inputAccessor.byteOffset, inputAccessor.count);
      const outputBufferF32 = this.__convertBufferView(Float32Array, outputBuffer, outputBufferInfo, outputAccessor);//new Float32Array(outputBuffer.buffer, outputBuffer.byteOffset + outputAccessor.byteOffset, outputAccessor.count * elemCount);
      const elemCount = outputBufferF32.length / inputBufferF32.length;
      const times = new Array(inputAccessor.count);
      for (let i = 0; i < inputAccessor.count; i++) {
        times[i] = inputBufferF32[i] * 1000; // SHould consider buffer stride
      }
      clip.timeline = times;
      clip.defaultEffect = "LINEAR" as any; // TODO bug of animation plugin?
      let values = [];
      for (let i = 0; i < outputAccessor.count; i++) {
        values[i] = [];
        for (let j = 0; j < elemCount; j++) {
          values[i][j] = outputBufferF32[i * elemCount + j]; // SHould consider buffer stride
        }
      }
      clip.values = values;
      defaultClip.push(clip);
    }
    return {
      default: defaultClip
    };
  }

  private _pathNameToGrimoire(name: string): { component: string, attributeName: string } {
    switch (name) {
      case "translation":
        return { component: "Transform", attributeName: "position" };
      case "rotation":
        return { component: "Transform", attributeName: "rotation" };
      case "scale":
        return { component: "Transform", attributeName: "scale" };
      case "weights":
        return { component: "GLTFVertexMorpher", attributeName: "weights" };
      default:
        throw new Error("Unsupported path type on grimoire");
    }
  }
}
