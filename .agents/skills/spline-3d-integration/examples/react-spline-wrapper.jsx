/**
 * SplineScene — Production-ready lazy-loaded React wrapper
 */

import React, { Suspense, lazy, useState } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

export function SplineScene({ scene, className = '', style = {}, onLoad, fallback }) {
    const [loaded, setLoaded] = useState(false);

    const handleLoad = (app) => {
        setLoaded(true);
        if (onLoad) onLoad(app);
    };

    const defaultFallback = (
        <div
            style={{
                width: '100%',
                height: '100%',
                minHeight: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.05)',
                borderRadius: 12,
            }}
        >
            <div
                style={{
                    width: 32,
                    height: 32,
                    border: '3px solid rgba(0,0,0,0.1)',
                    borderTopColor: '#000',
                    borderRadius: '50%',
                    animation: 'splineSpin 0.8s linear infinite',
                }}
            />
            <style>{`@keyframes splineSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div className={className} style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
            {!loaded && (fallback || defaultFallback)}
            <Suspense fallback={fallback || defaultFallback}>
                <Spline
                    scene={scene}
                    onLoad={handleLoad}
                    style={{
                        width: '100%',
                        height: '100%',
                        opacity: loaded ? 1 : 0,
                        transition: 'opacity 0.4s ease',
                    }}
                />
            </Suspense>
        </div>
    );
}

export default SplineScene;
