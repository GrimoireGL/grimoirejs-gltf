import ParserModule from "./ParserModule";
import GLTF from "./Schema/GLTF";
import GLTFImage from "./Schema/GLTFImage";
import GLTFBuffer from "./Schema/GLTFBuffer";
import GLTFMaterial from "./Schema/GLTFMaterial";
import GLTFSampler from "./Schema/GLTFSampler";

import Animation from "../Animation/Animation";

import Texture2D from "grimoirejs-fundamental/ref/Resource/Texture2D";
import Geometry from "grimoirejs-fundamental/ref/Geometry/Geometry";
import Material from "grimoirejs-fundamental/ref/Material/Material";
import MaterialFactory from "grimoirejs-fundamental/ref/Material/MaterialFactory";
import GLTFConstantConverter from "./ConstantConverter";
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
        if(!texInfo){
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
        const geo = new Geometry(this.__gl);
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
            const accessor = args.tf.accessors[args.primitive.attributes[attrib]];
            const bufAccessor = {};
            bufAccessor[attrib] = {
                size: GLTFConstantConverter.asVectorSize(accessor.type),
                type: accessor.componentType,
                stride: accessor.byteStride,
                offset: accessor.byteOffset
            };
            args.geometry.addAttributes(args.bufferViews[accessor.bufferView], bufAccessor);
        }
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
            const material = await MaterialFactory.get(this.__gl).instanciate("gltf-pbr-metalic-roughness");
            const pmr = args.material["pbrMetallicRoughness"];
            const matArgs = material.arguments;
            if (pmr.baseColorFactor) {
                matArgs.baseColorFactor = pmr.baseColorFactor;
            }
            if (pmr.baseColorTexture) {
                matArgs.baseColorTexture = args.textures[pmr.baseColorTexture.index];
            }
            if (pmr.metalicFactor) {
                matArgs.metalicFactor = pmr.metalicFactor;
            }
            if (pmr.metalicTexture) {
                matArgs.metalicTexture = args.textures[pmr.metalicTexture.index];
            }
            if (pmr.roughnessFactor) {
                matArgs.roughnessFactor = pmr.roughnessFactor;
            }
            if (pmr.roughnessTexture) {
                matArgs.roughnessTexture = args.textures[pmr.roughnessTexture.index];
            }
            if (args.material["emissiveFactor"]) {
                matArgs.emissiveFactor = args.material["emissiveFactor"];
            }
            if (args.material["emissiveTexture"]) {
                matArgs.emissiveTexture = args.textures[args.material["emissiveTexture"].index];
            }
            if (args.material["normalTexture"]) {
                matArgs.normalTexture = args.textures[args.material["normalTexture"].index];
            }
            if (args.material["metalicRoughnessTexture"]) {
                matArgs.metalicRoughnessTexture = args.textures[args.material["metalicRoughnessTexture"].index];
            }
            if (args.material["occlusionTexture"]) {
                matArgs.occlusionTexture = args.textures[args.material["occlusionTexture"].index];
            }
            return material;
        }
    }

    // Animation would be replaced in future
    // Because main part of animation should be implemented commonly, not limited in glTF.
    public loadAnimations(args: { tf: GLTF, bufferViews: { [key: string]: ArrayBufferView } }): { [key: string]: Animation } {
      const result:{ [key: string]: Animation } = {};
      for(let key in args.tf.animations){
        result[key] = new Animation(args.tf,key,args.bufferViews);
      }
      return result;
    }
}
