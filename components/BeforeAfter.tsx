"use client";

import { useEffect, useRef, useState } from "react";

type BeforeAfterProps = {
  before: string;
  after: string;
};

export function BeforeAfter({
  before,
  after,
}: BeforeAfterProps) {
  const [position, setPosition] =
    useState(50);
  const containerRef =
    useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    setPosition(50);
  }, [after]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateSize = () => {
      setSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    updateSize();

    const observer =
      new ResizeObserver(updateSize);

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "2 / 3",
        overflow: "hidden",
        borderRadius: 12,
        background: "#f3f1ed",
        userSelect: "none",
      }}
    >
      <img
        src={before}
        alt="До"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          background: "#f3f1ed",
          display: "block",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          width: position + "%",
          overflow: "hidden",
        }}
      >
        <img
          src={after}
          alt="После"
          style={{
            width: size.width || "100%",
            height: size.height || "100%",
            maxWidth: "none",
            objectFit: "contain",
            background: "#f3f1ed",
            display: "block",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: position + "%",
          width: 2,
          background: "#fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,.08)",
          transform: "translateX(-1px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "calc(" + position + "% - 20px)",
          top: "50%",
          transform: "translateY(-50%)",
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "#fff",
          border: "1px solid #ddd8ce",
          boxShadow: "0 2px 10px rgba(0,0,0,.16)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#24231f",
          fontSize: 18,
          fontWeight: 700,
          pointerEvents: "none",
          zIndex: 3,
        }}
      >
        ↔
      </div>

      <span
        style={{
          position: "absolute",
          left: 12,
          top: 12,
          padding: "6px 10px",
          borderRadius: 8,
          background: "rgba(36,35,31,.78)",
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          zIndex: 4,
          pointerEvents: "none",
        }}
      >
        До
      </span>

      <span
        style={{
          position: "absolute",
          right: 12,
          top: 12,
          padding: "6px 10px",
          borderRadius: 8,
          background: "rgba(36,35,31,.78)",
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          zIndex: 4,
          pointerEvents: "none",
        }}
      >
        После
      </span>

      <input
        aria-label="Положение ползунка до и после"
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(event) =>
          setPosition(
            Number(event.target.value)
          )
        }
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          cursor: "ew-resize",
          zIndex: 5,
          margin: 0,
        }}
      />
    </div>
  );
}
