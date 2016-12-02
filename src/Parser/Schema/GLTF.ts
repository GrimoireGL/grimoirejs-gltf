type GLTF = {
  accessors: {
    [acName: string]: {
      bufferView: string,
      byteOffset: number,
      byteStride: number,
      count: number,
      componentType: number,
      type: string,
      max?: number[],
      min?: number[]
    }
  },
  bufferViews: {
    [bufName: string]: {
      buffer: string,
      byteLength: number,
      byteOffset: number,
      target: number
    }
  },
  buffers: {
    [bufName: string]: {
      byteLength: number,
      type: string,
      uri: string
    }
  },
  extensionUsed: string[],
  materials: {
    [matName: string]: {
      extensions: {
        [key: string]: any,
        KHR_materials_common?: {
          doubleSided: boolean,
          jointCount: number,
          technique: string,
          transparent: boolean,
          values: {
            ambient: number[],
            diffuse: number[] | string,
            emission: number[],
            shininess: number,
            specular: number[]
          }
        }
      },
      name: string
    }
  },
  meshes: {
    [meshName: string]: {
      name: string,
      primitives: {
        attributes: { [semantic: string]: string },
        indices: string,
        material: string,
        mode: number
      }[]
    }
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
    [animationKey: string]: {
      channels: {
        target: {
          id: string,
          path: string
        },
        sampler: string
      }[],
      samplers: {
        [samplerKey: string]: {
          input: string,
          interpolation: string,
          output: string
        }
      },
      parameters: {
        [paramKey: string]: string
      }
    }
  }
};

interface Dummy {
  // tricky way not to be included as export
}

export default GLTF;
