<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';
  
  // Props
  export let autoStart = true;
  export let facingMode = 'environment'; // 'environment' for back camera, 'user' for front camera
  
  // Internal state
  let videoElement: HTMLVideoElement;
  let canvasElement: HTMLCanvasElement;
  let stream: MediaStream | null = null;
  let scanning = false;
  let error: string | null = null;
  let scanInterval: ReturnType<typeof setInterval> | null = null;
  
  const dispatch = createEventDispatcher<{
    scan: { barcode: string };
    error: { message: string };
  }>();
  
  // Start the barcode scanner
  async function startScanner() {
    if (!browser || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera access is not supported in this browser');
      return;
    }
    
    try {
      // Request camera access
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });
      
      if (videoElement) {
        videoElement.srcObject = stream;
        await videoElement.play();
        
        // Start scanning for barcodes
        scanning = true;
        startScanningLoop();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      const message = err instanceof Error ? err.message : 'Failed to access camera';
      setError(message);
    }
  }
  
  // Stop the barcode scanner
  function stopScanner() {
    scanning = false;
    
    if (scanInterval) {
      clearInterval(scanInterval);
      scanInterval = null;
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    
    if (videoElement) {
      videoElement.srcObject = null;
    }
  }
  
  // Toggle the scanner
  function toggleScanner() {
    if (scanning) {
      stopScanner();
    } else {
      startScanner();
    }
  }
  
  // Switch camera (front/back)
  function switchCamera() {
    facingMode = facingMode === 'environment' ? 'user' : 'environment';
    if (scanning) {
      stopScanner();
      startScanner();
    }
  }
  
  // Set error and dispatch error event
  function setError(message: string) {
    error = message;
    dispatch('error', { message });
  }
  
  // Start the scanning loop
  function startScanningLoop() {
    if (scanInterval) {
      clearInterval(scanInterval);
    }
    
    scanInterval = setInterval(() => {
      if (!scanning || !videoElement || !canvasElement) return;
      
      try {
        const context = canvasElement.getContext('2d');
        if (!context) return;
        
        // Make sure video dimensions are set
        if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) return;
        
        // Set canvas dimensions to match video
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        
        // Draw current video frame to canvas
        context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        
        // Get image data for barcode detection
        const imageData = context.getImageData(0, 0, canvasElement.width, canvasElement.height);
        
        // In a real implementation, you would use a barcode scanning library here
        // For example, with ZXing or QuaggaJS
        // This is a placeholder for the actual barcode detection logic
        
        // For demo purposes, let's simulate finding a barcode after a random delay
        // In a real app, replace this with actual barcode detection
        if (Math.random() < 0.01) { // 1% chance of "finding" a barcode each scan
          const simulatedBarcode = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
          handleBarcodeDetected(simulatedBarcode);
        }
      } catch (err) {
        console.error('Error during barcode scanning:', err);
      }
    }, 100); // Scan 10 times per second
  }
  
  // Handle detected barcode
  function handleBarcodeDetected(barcode: string) {
    // Stop scanning after successful detection
    stopScanner();
    
    // Dispatch the scan event with the barcode
    dispatch('scan', { barcode });
  }
  
  // Initialize component
  onMount(() => {
    if (autoStart) {
      startScanner();
    }
  });
  
  // Clean up on component destruction
  onDestroy(() => {
    stopScanner();
  });
</script>

<div class="barcode-scanner">
  <div class="video-container relative overflow-hidden rounded-lg bg-black">
    <video
      bind:this={videoElement}
      class="w-full h-auto"
      playsinline
      muted
    ></video>
    
    <canvas
      bind:this={canvasElement}
      class="absolute top-0 left-0 w-full h-full opacity-0"
    ></canvas>
    
    <div class="scanner-overlay absolute inset-0 pointer-events-none">
      <div class="scanner-target border-2 border-primary w-2/3 h-1/3 mx-auto my-auto rounded-lg"></div>
    </div>
    
    {#if !scanning && !error}
      <div class="absolute inset-0 flex items-center justify-center bg-black/70">
        <button class="btn btn-primary" on:click={startScanner}>
          Start Scanner
        </button>
      </div>
    {/if}
    
    {#if error}
      <div class="absolute inset-0 flex items-center justify-center bg-black/70">
        <div class="text-center p-4">
          <div class="text-error mb-2">{error}</div>
          <button class="btn btn-primary" on:click={startScanner}>
            Try Again
          </button>
        </div>
      </div>
    {/if}
  </div>
  
  <div class="controls flex justify-between mt-4">
    <button class="btn btn-sm" on:click={toggleScanner}>
      {scanning ? 'Pause' : 'Resume'}
    </button>
    
    <button class="btn btn-sm" on:click={switchCamera}>
      Switch Camera
    </button>
  </div>
  
  <div class="text-xs text-center mt-2 text-base-content/70">
    Position the barcode within the frame to scan
  </div>
</div>

<style>
  .video-container {
    aspect-ratio: 4/3;
    max-height: 300px;
  }
  
  .scanner-target {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
