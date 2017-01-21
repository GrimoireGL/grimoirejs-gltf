import GLTFShader from "./GLTFShader";
import GLTFTechnique from "./GLTFTechnique";
import GLTFSkin from "./GLTFSkin";
import GLTFSampler from "./GLTFSampler";
import GLTFTexture from "./GLTFTexture";
import GLTFImage from "./GLTFImage";
import GLTFNode from "./GLTFNode";
import GLTFAnimation from "./GLTFAnimation";
import GLTFMesh from "./GLTFMesh";
import GLTFMaterial from "./GLTFMaterial";
import GLTFBuffer from "./GLTFBuffer";
import GLTFBufferView from "./GLTFBufferView";
import GLTFAccessor from "./GLTFAccessor";
type GLTF = {
    accessors: {
        [acName: string]: GLTFAccessor;
    },
    bufferViews: {
        [bufName: string]: GLTFBufferView;
    },
    buffers: {
        [bufName: string]: GLTFBuffer;
    },
    extensionUsed: string[],
    materials: {
        [matName: string]: GLTFMaterial;
    },
    meshes: {
        [meshName: string]: GLTFMesh;
    },
    nodes: {
        [nodeName: string]: GLTFNode;
    },
    scene: string,
    scenes: {
        [sceneName: string]: {
            nodes: string[]
        }
    },
    shaders: {
        [shaderKey: string]: GLTFShader;
    },
    programs: {
        [programKey: string]: {
            attributes: string[],
            fragmentShader: string,
            vertexShader: string
        }
    },
    techniques: {
        [techniqueKey: string]: GLTFTechnique;
    },
    images: {
        [imgKey: string]: GLTFImage;
    },
    textures: {
        [textureKey: string]: GLTFTexture;
    },
    samplers: {
        [samplerKey: string]: GLTFSampler;
    },
    animations: {
        [animationKey: string]: GLTFAnimation;
    },
    skins: {
        [skinKey: string]: GLTFSkin;
    }
};

interface Dummy {
    // tricky way not to be included as export
}

export default GLTF;
