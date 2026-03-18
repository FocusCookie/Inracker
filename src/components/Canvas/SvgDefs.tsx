import React, { memo } from "react";

type SvgDefsProps = {
  backgroundWidth?: number;
  backgroundHeight?: number;
};

const SvgDefs: React.FC<SvgDefsProps> = ({ backgroundWidth, backgroundHeight }) => {
  return (
    <defs>
      <filter id="subtleDropShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
        <feOffset dx="0" dy="1" result="offsetblur" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.3" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {backgroundWidth && backgroundHeight && (
        <clipPath id="roundedImageClip">
          <rect
            x={-backgroundWidth / 2}
            y={-backgroundHeight / 2}
            width={backgroundWidth}
            height={backgroundHeight}
            rx="12"
            ry="12"
          />
        </clipPath>
      )}
    </defs>
  );
};

export default memo(SvgDefs);
