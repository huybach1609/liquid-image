import { expect, it, describe, beforeEach } from "bun:test";
import { useBatchStore } from "../batch.store";

describe("BatchStore", () => {
  beforeEach(() => {
    // Reset store state manually
    useBatchStore.setState({ 
      queue: [],
      pipeline: [], 
      logs: [], 
      isRunning: false,
      outputDirectory: "./out/",
      stats: { total: 0, queued: 0, running: 0, done: 0, error: 0 }
    });
  });

  it("should have initial state", () => {
    const state = useBatchStore.getState();
    expect(state.queue).toEqual([]);
    expect(state.pipeline).toEqual([]);
    expect(state.isRunning).toBe(false);
  });

  it("should add files to the queue", () => {
    useBatchStore.getState().addFiles([
      { path: "/home/user/img1.jpg", name: "img1.jpg" },
      { path: "/home/user/img2.png", name: "img2.png" }
    ]);
    
    const state = useBatchStore.getState();
    expect(state.queue).toHaveLength(2);
    expect(state.queue[0].fileName).toBe("img1.jpg");
    expect(state.stats.total).toBe(2);
    expect(state.stats.queued).toBe(2);
  });

  it("should remove a file from the queue", () => {
    useBatchStore.getState().addFiles([{ path: "/test.jpg", name: "test.jpg" }]);
    const stateBefore = useBatchStore.getState();
    const id = stateBefore.queue[0].id;
    
    useBatchStore.getState().removeFile(id);
    expect(useBatchStore.getState().queue).toHaveLength(0);
    expect(useBatchStore.getState().stats.total).toBe(0);
  });

  it("should add and remove pipeline steps", () => {
    useBatchStore.getState().addStep("Resize");
    expect(useBatchStore.getState().pipeline).toHaveLength(1);
    expect(useBatchStore.getState().pipeline[0].functionId).toBe("Resize");

    const stepId = useBatchStore.getState().pipeline[0].id;
    useBatchStore.getState().removeStep(stepId);
    expect(useBatchStore.getState().pipeline).toHaveLength(0);
  });

  it("should update item status and stats", () => {
    useBatchStore.getState().addFiles([{ path: "/test.jpg", name: "test.jpg" }]);
    useBatchStore.getState().updateItemStatus(0, "running");
    
    let state = useBatchStore.getState();
    expect(state.queue[0].status).toBe("running");
    expect(state.stats.running).toBe(1);
    expect(state.stats.queued).toBe(0);

    useBatchStore.getState().updateItemStatus(0, "done");
    state = useBatchStore.getState();
    expect(state.queue[0].status).toBe("done");
    expect(state.stats.done).toBe(1);
    expect(state.stats.running).toBe(0);
  });
});
