// src/app/vemo/[vemo]/components/DrawingCanvas/DynamicReactSketchCanvas.tsx
import React, { forwardRef, Suspense } from 'react';
import { ReactSketchCanvas, ReactSketchCanvasProps, ReactSketchCanvasRef } from 'react-sketch-canvas';
import { useSearchParams } from 'next/navigation';

const DynamicReactSketchCanvas = forwardRef<ReactSketchCanvasRef, ReactSketchCanvasProps>((props, ref) => {
    return <ReactSketchCanvas {...props} ref={ref} />;
});

DynamicReactSketchCanvas.displayName = 'DynamicReactSketchCanvas';

export default DynamicReactSketchCanvas;