import { useEffect, useRef } from "react";
import viewer from "./three/Viewer";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.appendChild(viewer.canvas);
    }

    return () => {
      containerRef.current?.removeChild(viewer.canvas);
    };
  }, [containerRef]);

  return <div ref={containerRef}></div>;
}

export default App;
