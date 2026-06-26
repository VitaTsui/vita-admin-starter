export const getParametricEquation = (
  startRatio: number,
  endRatio: number,
  isSelected: boolean,
  isHovered: boolean,
  k: number,
  h: number,
  yOffset: number = 0
) => {
  const midRatio = (startRatio + endRatio) / 2;
  const startRadian = startRatio * Math.PI * 2;
  const endRadian = endRatio * Math.PI * 2;
  const midRadian = midRatio * Math.PI * 2;

  let selected = isSelected;
  if (startRatio === 0 && endRatio === 1) {
    selected = false;
  }

  const offsetX = selected ? Math.cos(midRadian) * 0.1 : 0;
  const offsetY = selected ? Math.sin(midRadian) * 0.1 : 0;
  const hoverRate = isHovered ? 1.05 : 1;

  return {
    u: {
      min: -Math.PI,
      max: Math.PI * 3,
      step: Math.PI / 32,
    },
    v: {
      min: 0,
      max: Math.PI * 2,
      step: Math.PI / 64,
    },
    x(u: number, v: number) {
      if (u < startRadian) {
        return (
          offsetX + Math.cos(startRadian) * (1 + Math.cos(v) * k) * hoverRate
        );
      }
      if (u > endRadian) {
        return (
          offsetX + Math.cos(endRadian) * (1 + Math.cos(v) * k) * hoverRate
        );
      }
      return offsetX + Math.cos(u) * (1 + Math.cos(v) * k) * hoverRate;
    },
    y(u: number, v: number) {
      if (u < startRadian) {
        return (
          offsetY +
          Math.sin(startRadian) * (1 + Math.cos(v) * k) * hoverRate +
          yOffset
        );
      }
      if (u > endRadian) {
        return (
          offsetY +
          Math.sin(endRadian) * (1 + Math.cos(v) * k) * hoverRate +
          yOffset
        );
      }
      return (
        offsetY + Math.sin(u) * (1 + Math.cos(v) * k) * hoverRate + yOffset
      );
    },
    z(u: number, v: number) {
      if (u < -Math.PI * 0.5) {
        return Math.sin(u);
      }
      if (u > Math.PI * 2.5) {
        return Math.sin(u) * h * 0.1;
      }
      return Math.sin(v) > 0 ? 1 * h * 0.1 : -1;
    },
  };
};
