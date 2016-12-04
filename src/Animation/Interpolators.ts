import Interpolator from "./Interpolator";
import GLM from "grimoirejs-math/ref/GLM";
const quat = GLM.quat;
export default {
  LINEAR: function(t: number, v1: number[], v2: number[]): number[] {
    const res = new Array(v1.length);
    for (let i = 0; i < v1.length; i++) {
      res[i] = v1[i] + (v2[i] - v1[i]) * t;
    }
    return res;
  },
  SPHERICAL: function(t: number, v1: number[], v2: number[]): number[] {
    const res = new Array(v1.length);
    quat.slerp(res, v1, v2, t);
    return res;
  }
} as { [key: string]: Interpolator };
