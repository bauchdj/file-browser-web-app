import React, { useEffect } from 'react';

const ScriptLoader = ({ src, onLoad }) => {
	useEffect(() => {
		// Create script element
		const script = document.createElement('script');
		script.src = src;
		script.async = false;

		// Define load event listener
		const handleLoad = () => {
			if (onLoad) onLoad();
		};

		// Attach event listeners
		script.addEventListener('load', handleLoad);
		document.head.appendChild(script);

		// Cleanup function
		return () => {
			script.removeEventListener('load', handleLoad);
			document.head.removeChild(script);
		};
	}, [src, onLoad]);

	// Render nothing, as this component is purely functional
	return null;
};

export default ScriptLoader;

