interface GLTFTechnique {
    attributes: {
        [variableName: string]: string;
    };
    parameters: {
        [variableName: string]: {
            type: number,
            semantic: string,
            value?: any;
        }
    };
    program: string,
    states: {
        enable: number[]
    };
    uniforms: {
        [variableName: string]: string;
    };
}
export default GLTFTechnique;
