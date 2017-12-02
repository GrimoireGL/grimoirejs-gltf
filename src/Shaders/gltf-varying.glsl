varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;
#ifdef ATTRIBUTE_TANGENT_ENABLED
varying vec3 vTangent;
#endif
#ifdef ATTRIBUTE_COLOR_0_ENABLED
varying vec3 vVertexColor;
#endif