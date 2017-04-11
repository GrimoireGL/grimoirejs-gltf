import GLTF from "./Schema/GLTF";
import GLTFImage from "./Schema/GLTFImage";
import GLTFBuffer from "./Schema/GLTFBuffer";

import ParserModuleBase from "./ParserModuleBase";
import Texture2D from "grimoirejs-fundamental/ref/Resource/Texture2D";
import Geometry from "grimoirejs-fundamental/ref/Geometry/Geometry";
import Parser from "./Parser";

import {
    ConvertToTextureArgument,
    LoadBufferViewsArgument,
    LoadPrimitivesOfMeshArgument,
    LoadPrimitiveArgument,
    AppendIndicesArgument,
    AddVertexAttributesArgument
} from "./Arguments";

export default class ParserModule extends ParserModuleBase {
    protected __gl: WebGLRenderingContext;

    constructor(public parser: Parser, public baseDirectory: string) {
        super();
        this.__gl = parser.gl;
    }

    public fetchGLTF(url: string): Promise<ArrayBuffer> {
        return undefined;
    }
    /**
     * Load .gltf file
     * @return {Promise<GLTF>} [description]
     */
    public loadAsGLTF(tf: ArrayBuffer): GLTF {
        return undefined;
    }

    /**
     * Start loading texture resource.
     * @return {Promise<Texture2D>} [description]
     */
    public fetchTextureResource(tf: GLTFImage): Promise<HTMLImageElement> {
        return undefined;
    }

    /**
     * Start loading texture resource.
     * @return {Promise<Texture2D>} [description]
     */
    public loadTextureResources(tf: GLTF): Promise<{ [key: string]: Texture2D }> {
        return undefined;
    }

    /**
     * Load image as texture
     * @return {Promise<Texture2D>} [description]
     */
    public convertTotexture(arg: ConvertToTextureArgument): Texture2D {
        return undefined;
    }

    /**
     * Start loading buffer resource.
     * @return {Promise<ArrayBuffer>} [description]
     */
    public loadBufferResource(tf: GLTFBuffer): Promise<ArrayBuffer> {
        return undefined;
    }

    public loadBufferResources(tf: GLTF): Promise<{ [key: string]: ArrayBuffer }> {
        return undefined;
    }

    public loadBufferViews(args: LoadBufferViewsArgument): { [key: string]: ArrayBufferView } {
        return undefined;
    }

    public loadPrimitivesOfMesh(args: LoadPrimitivesOfMeshArgument): { [key: string]: Geometry[] } {
        return undefined;
    }

    public loadPrimitive(args: LoadPrimitiveArgument): Geometry {
        return undefined;
    }

    public appendIndices(args: AppendIndicesArgument): boolean {
        return undefined;
    }

    public addVertexAttributes(args: AddVertexAttributesArgument): boolean {
        return undefined;
    }
}
