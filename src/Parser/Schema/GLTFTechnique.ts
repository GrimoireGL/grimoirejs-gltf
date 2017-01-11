interface GLTFTechnique {
    attributes: {
        [variableName: string]: string;
    },
    parameters: {
        [variableName: string]: {
            type: number,
            semantic: string
        }
    },
    program: string,
    states: {
        enable: number[]
    },
    unifroms: {
        [variableName: string]: string;
    }
}
export default GLTFTechnique;