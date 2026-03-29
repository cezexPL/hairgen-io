export interface GenerationRequest {
  sourceImageUrl: string;
  prompt: string;
  styleId?: string;
}

export interface GenerationResult {
  imageUrl: string;
  requestId: string;
  processingTimeMs: number;
}

export abstract class BaseProvider {
  abstract readonly name: string;

  abstract generate(request: GenerationRequest): Promise<GenerationResult>;

  abstract checkHealth(): Promise<boolean>;
}
