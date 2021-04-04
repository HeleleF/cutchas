import { useRef } from 'react';
import Draggable, { DraggableData } from 'react-draggable';

interface WrappedImageProps {
    canDrag?: boolean;
    onDragEnd?: (dragData: DraggableData) => void;
    [prop: string]: unknown;
}
/**
 * Simple wrapper for <img> so we can pass an <img> ref to Draggable
 * (necessary because: https://github.com/react-grid-layout/react-draggable#draggable-props)
 */
function WrappedImage({ onDragEnd, canDrag = false, ...props }: WrappedImageProps): JSX.Element {
    const nodeRef = useRef(null);

    if (canDrag && onDragEnd) {
        return (
            <Draggable onStop={(_, data) => onDragEnd(data)} nodeRef={nodeRef} bounds=".Cutcha">
                {/** draggable=false to disable native browser-dragging behavior */}
                <img {...props} draggable={false} ref={nodeRef} />
            </Draggable>
        );
    } else {
        return <img {...props} />;
    }
}

export default WrappedImage;
