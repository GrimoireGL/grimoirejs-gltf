interface GLTFPrimitive{
    attributes: { [semantic: string]: string };
    indices: string;
    material: string;
    mode: number;
}

export default GLTFPrimitive;
