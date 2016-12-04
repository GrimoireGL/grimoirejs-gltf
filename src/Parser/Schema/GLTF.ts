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
    [nodeName: string]: {
      children: string[],
      matrix: number[],
      translation: number[],
      rotation: number[],
      scale: number[],
      meshes: string[],
      name: string
    }
  },
  scene: string,
  scenes: {
    [sceneName: string]: {
      nodes: string[]
    }
  },
  images: {
    [imgKey: string]: {
      name: string,
      uri: string
    }
  },
  textures: {
    [textureKey: string]: {
      format: number,
      internalFormat: number,
      sampler: string,
      source: string,
      target: number,
      type: number
    }
  },
  samplers: {
    [samplerKey: string]: {
      magFilter: number,
      minFilter: number,
      wrapS: number,
      wrapT: number
    }
  },
  animations: {
    [animationKey: string]: GLTFAnimation;
  }
};

interface Dummy {
  // tricky way not to be included as export
}

export default GLTF;
