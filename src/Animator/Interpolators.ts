import Interpolator from "./Interpolator";
export default {
  LINEAR: function(t: number): number {
    return t;
  }
} as { [key: string]: Interpolator };
