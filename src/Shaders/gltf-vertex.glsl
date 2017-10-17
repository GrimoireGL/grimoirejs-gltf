@ExposeMacro(int,jointCount,JOINT_COUNT,0)
#ifdef VS
#if JOINT_COUNT > 0
  @JOINTMATRIX
  uniform mat4 boneMatrices[JOINT_COUNT];
#endif
  @NORMAL
  attribute vec3 normal;
  @POSITION
  attribute vec3 position;
#ifdef ATTRIBUTE_TEXCOORD_0_ENABLED
  @TEXCOORD_0
  attribute vec2 texCoord;
#endif
#ifdef ATTRIBUTE_TANGENT_ENABLED
  @TANGENT
  attribute vec3 tangent;
#endif
#if JOINT_COUNT > 0
  @JOINTS_0
  attribute vec4 joint;
  @WEIGHTS_0
  attribute vec4 weight;
#endif
  uniform mat4 _matPVM;
  uniform mat4 _matM;
  @MODELINVERSETRANSPOSE
  uniform mat4 normalMatrix;

  @CAMERA_POSITION
  uniform vec3 _cameraPositionVert;
  void main(){
    mat4 transform = _matM;
    mat4 projectionTransform = _matPVM;
    mat4 normalTransform = _matM;
    #if JOINT_COUNT > 0
      mat4 skinMat = weight.x * boneMatrices[int(joint.x)] + weight.y * boneMatrices[int(joint.y)] + weight.z * boneMatrices[int(joint.z)] + weight.w * boneMatrices[int(joint.w)];
      transform *= skinMat;
      normalTransform *= skinMat;
      projectionTransform *= skinMat;
    #endif
    #ifdef ATTRIBUTE_TEXCOORD_0_ENABLED
        vUV = texCoord;
    #else
        vUV  = position.xy /2.0 + vec2(0.5);
    #endif
    vNormal = normalize(mat3(normalTransform) * normal);
    vPosition = (transform * vec4(position,1.0)).xyz;
    #ifdef ATTRIBUTE_TANGENT_ENABLED
    vTangent = normalize(mat3(normalTransform) * tangent);
    #endif
    gl_Position = projectionTransform * vec4(position,1.0);
  }
#endif
