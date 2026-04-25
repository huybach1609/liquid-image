  1. Backend (Rust - src-tauri/src/magick-service.rs)
   * [x] Core Batch Command: Implement run_batch (or similar) to handle multiple files.
   * [x] Parallelism: Use Rust's concurrency (e.g., tokio or rayon) to process images in parallel
     based on the "Batch workers" setting.
   * [x] Progress Reporting: Implement an event-based system (Tauri emit) to send real-time
     progress (e.g., "3/10 finished", "Error on file X") back to the frontend.
   * [x] Dry Run Logic: Implement a fast "dry run" that validates the pipeline arguments against
     all files without actually writing the output.
   * [x] Error Handling: Add logic to handle "Continue on error" or "Stop on error" strategies as
     defined in the mockup.

  2. Frontend Command Layer (src/shared/tauri/commands.ts)
   * [x] Define Interfaces: Create TypeScript interfaces for RunBatchRequest, BatchProgressEvent,
     and BatchResult.
   * [x] Register Commands: Add the runBatch, cancelBatch, and runBatchDryRun command wrappers.

  3. Frontend logic (src/features/batch/)
   * [x] useBatchRunner.ts Implementation:
       * Replace the TODOs with actual Tauri invoke calls.
       * Listen for progress events from the backend and update the batch.store.ts.
   * [x] CLI Builder: Create a buildBatchCliPipeline.ts (similar to buildSingleCliPreview.ts) to
     translate the batch pipeline steps into ImageMagick arguments.
   * [x] Queue Management: Ensure batch.store.ts correctly handles adding/removing large sets of
     files.

  4. UI Polish (src/pages/BatchModePage.tsx)
   * [x] Queue UI: Connect the BatchQueuePanel to the store to show file status
     (pending/running/done/error).
   * [x] Progress Feedback: Update the BatchBottomBar with a real progress bar and estimated time
     remaining.
   * [x] Logs: Connect BatchLogPanel to the real-time log output from the backend.

  5. Settings Integration
   * [x] Workers: Wire up the "Batch workers" setting from SettingsPage to the Rust backend
     execution.
   * [x] Notifications: Status updates via logs and UI state (native notifications pending plugin installation).
