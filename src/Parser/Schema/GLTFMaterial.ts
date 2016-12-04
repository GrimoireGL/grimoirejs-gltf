interface GLTFMaterial {
  extensions: {
    [key: string]: any;
    KHR_materials_common?: {
      doubleSided: boolean;
      jointCount: number;
      technique: string;
      transparent: boolean;
      values: {
        ambient?: number[];
        diffuse?: number[] | string;
        emission?: number[];
        shininess?: number;
        specular?: number[];
      };
    };
  };
  values: {
    [paramName: string]: any;
  };
  name: string;
}

export default GLTFMaterial;
