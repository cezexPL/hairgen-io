import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "hairgen",
  eventKey: process.env.INNGEST_EVENT_KEY,
});

export type HairstyleGenerateEvent = {
  name: "hairstyle/generate.requested";
  data: {
    generationId: string;
    userId: string;
    sourceImageUrl: string;
    prompt: string;
    styleId?: string;
    styleCategory?: string;
  };
};

export type R2CleanupEvent = {
  name: "r2/cleanup.scheduled";
  data: {
    r2Key: string;
  };
};
