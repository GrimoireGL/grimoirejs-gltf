import ResourceResolver from "../Util/ResourceResolver";
import Accessor from "../Accessor/Accessor";
import Matrix from "grimoirejs-math/ref/Matrix";
import Animation from "../Animation/Animation";
import GLTFConstantConverter from "./ConstantConverter";
import Vector3 from "grimoirejs-math/ref/Vector3";
import AABB from "grimoirejs-math/ref/AABB";
import TextFileResolver from "grimoirejs-fundamental/ref/Asset/TextFileResolver";
import GLTF from "./Schema/GLTF";
import Buffer from "grimoirejs-fundamental/ref/Resource/Buffer";
import Geometry from "grimoirejs-fundamental/ref/Geometry/Geometry";
import VertexBufferAccessor from "grimoirejs-fundamental/ref/Geometry/VertexBufferAccessor";
import IndexBufferInfo from "grimoirejs-fundamental/ref/Geometry/IndexBufferInfo";
import ImageResolver from "grimoirejs-fundamental/ref/Asset/ImageResolver";
import Texture2D from "grimoirejs-fundamental/ref/Resource/Texture2D";
import ParserModule from "./ParserModule";
import DefaultParserModule from "./DefaultParserModule";
import InstanciationRecipe from "./InstanciationRecipe";

// Modules

import NormalComplementorModule from "./Modules/NormalComplementorModule";
import IndexComplementorModule from "./Modules/IndexComplementorModule";
import EmbeddedBufferModule from "./Modules/EmbeddedBufferModule";

export default class GLTFParser {
    public static parserModules: (typeof ParserModule)[] = [
        EmbeddedBufferModule,
        IndexComplementorModule,
        NormalComplementorModule,
        DefaultParserModule
    ];

    private parserModuleInstances: ParserModule[];

    public callParserModule<T, G>(target: (p: ParserModule) => ((arg: G) => T), arg?: G): T {
        for (let i = 0; i < this.parserModuleInstances.length; i++) {
            const module = this.parserModuleInstances[i];
            const moduleMethod = target(module);
            if (moduleMethod === void 0) {
                continue;
            }
            const result = moduleMethod.call(module, arg) as T;
            if (result !== void 0) {
                return result;
            }
        }
        throw new Error(`Parsing gltf failed. At the module "${target.toString()}"`);
    }

    constructor(public gl: WebGLRenderingContext, public url: string) {
        this.parserModuleInstances = [];
        for (let i = 0; i < GLTFParser.parserModules.length; i++) {
            const moduleCtor = GLTFParser.parserModules[i];
            this.parserModuleInstances.push(new moduleCtor(this, url.substr(0, url.lastIndexOf("/") + 1)));
        }
    }

    public async parse(): Promise<InstanciationRecipe> {
        const result:InstanciationRecipe = {} as InstanciationRecipe;
        const gltfRaw = await this.callParserModule(t => t.fetchGLTF, this.url);
        const gltf = this.callParserModule(t => t.loadAsGLTF, gltfRaw);
        result.tf = gltf;
        const textureResourcePromise = await this.callParserModule(t => t.loadTextureResources, gltf).then(textures=>{
          return this.callParserModule(t=>t.loadMaterials,{tf:gltf,textures:textures});
        }).then(materials=>{
          result.materials = materials;
        });
        const bufferResources =
        await this.callParserModule(t => t.loadBufferResources, gltf)
        .then(buffers =>{
            const bufferViews = this.callParserModule(t => t.loadBufferViews, { tf: gltf, buffers: buffers });
            const primitives = this.callParserModule(t=>t.loadPrimitivesOfMesh,{tf:gltf,bufferViews:bufferViews});
            const animations = this.callParserModule(t => t.loadAnimations, { tf: gltf, bufferViews: bufferViews });
            result.primitives = primitives;
          }
        );
        return result;
    }

    public static async parseFromURL(gl: WebGLRenderingContext, url: string): Promise<InstanciationRecipe> {
        const parser = new GLTFParser(gl, url);
        return parser.parse();
    }
}
