import { useEffect, useState } from 'react';

const PORTRAIT_QUERY = '(orientation: portrait)';

export default function useMediaQuery(): boolean {
    const [isPortrait, setIsPortrait] = useState(() => {
        return window.matchMedia(PORTRAIT_QUERY).matches;
    });

    useEffect(() => {
        const mediaQueryList = window.matchMedia(PORTRAIT_QUERY);

        const handleChange = () => {
            setIsPortrait(mediaQueryList.matches);
        };

        mediaQueryList.addEventListener('change', handleChange);

        return () => {
            mediaQueryList.removeEventListener('change', handleChange);
        };
    }, []);

    return isPortrait;
}
