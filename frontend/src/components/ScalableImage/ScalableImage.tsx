import './ScalableImage.css';

import React, { useState } from 'react';
import WrappedImage from '../WrappedImage/WrappedImage';

interface ScalableImageProps {
    scaleFactor?: number;
    [prop: string]: unknown;
}

function ScalableImage({ scaleFactor = 1, ...props }: ScalableImageProps): JSX.Element {
    const [dimension, setDimension] = useState({ width: 0, height: 0 });

    const imgLoaded = ({ target }: React.ChangeEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = target;
        setDimension({
            width: naturalWidth * scaleFactor,
            height: naturalHeight * scaleFactor,
        });
    };

    return <WrappedImage {...props} {...dimension} onLoad={imgLoaded} />;
}

export default ScalableImage;
