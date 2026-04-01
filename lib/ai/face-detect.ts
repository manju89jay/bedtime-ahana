export type FaceDetectionInput = {
  photoBase64: string;
};

export type FaceDetectionOutput = {
  detected: boolean;
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number };
};

const isStubMode = () => process.env.USE_STUBS === 'true';

function detectFaceStub(_input: FaceDetectionInput): FaceDetectionOutput {
  return {
    detected: true,
    confidence: 0.97,
    boundingBox: { x: 80, y: 60, width: 200, height: 240 },
  };
}

export async function detectFace(
  input: FaceDetectionInput
): Promise<FaceDetectionOutput> {
  if (isStubMode()) {
    return detectFaceStub(input);
  }

  // Live mode: InsightFace / MediaPipe
  // For now, return stub since we don't have a face detection model configured
  return detectFaceStub(input);
}

export async function detectFaces(
  photos: string[]
): Promise<FaceDetectionOutput[]> {
  const results: FaceDetectionOutput[] = [];
  for (const photo of photos) {
    const result = await detectFace({ photoBase64: photo });
    results.push(result);
  }
  return results;
}
