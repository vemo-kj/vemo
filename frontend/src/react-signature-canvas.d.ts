declare module 'react-signature-canvas' {
    import { Component } from 'react';

    interface SignatureCanvasProps {
        penColor?: string;
        canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
        backgroundColor?: string;
        onBegin?: () => void;
        onEnd?: () => void;
        clearOnResize?: boolean;
        minWidth?: number;
        maxWidth?: number;
        velocityFilterWeight?: number;
    }

    class SignatureCanvas extends Component<SignatureCanvasProps> {
        clear: () => void;
        fromDataURL: (
            dataUrl: string,
            options?: { ratio?: number; width?: number; height?: number },
        ) => void;
        toDataURL: (type?: string, encoderOptions?: number) => string;
        getTrimmedCanvas: () => HTMLCanvasElement;
    }

    export default SignatureCanvas;
}
