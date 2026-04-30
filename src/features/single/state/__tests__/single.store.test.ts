import { expect, it, describe, beforeEach } from "bun:test";
import { useSingleStore } from "../single.store";

describe("SingleStore", () => {
  beforeEach(() => {
    useSingleStore.getState().setSelectedFile(null);
    useSingleStore.getState().setSelectedFunction("Convert");
    useSingleStore.getState().resetAllFunctionParams();
  });

  it("should have initial state", () => {
    const state = useSingleStore.getState();
    expect(state.selectedFile).toBe(null);
    expect(state.selectedFunction).toBe("Convert");
  });

  it("should update function params", () => {
    useSingleStore.getState().updateFunctionParam("quality", 90);
    expect(useSingleStore.getState().functionParams.quality).toBe(90);
  });

  it("should keep params separate between functions", () => {
    // 1. Set param for Convert
    useSingleStore.getState().setSelectedFunction("Convert");
    useSingleStore.getState().updateFunctionParam("quality", 90);
    
    // 2. Switch to Crop, should be empty
    useSingleStore.getState().setSelectedFunction("Crop");
    expect(useSingleStore.getState().functionParams).toEqual({});
    
    // 3. Switch back to Convert, should have 90
    useSingleStore.getState().setSelectedFunction("Convert");
    expect(useSingleStore.getState().functionParams.quality).toBe(90);
  });

  it("should reset current function params", () => {
    useSingleStore.getState().updateFunctionParam("quality", 90);
    useSingleStore.getState().resetCurrentFunctionParams();
    expect(useSingleStore.getState().functionParams).toEqual({});
  });
});
