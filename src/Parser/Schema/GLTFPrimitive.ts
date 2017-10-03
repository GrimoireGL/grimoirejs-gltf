interface GLTFPrimitive {
    attributes: { [semantic: string]: string };
    indices: string;
    material: string;
    mode: number;
    targets: { [semantic: string]: string }[];
}

export default GLTFPrimitive;
