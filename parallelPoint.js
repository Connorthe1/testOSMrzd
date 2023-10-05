export function findPointsWithMargin(Ax, Ay, Bx, By, offset) {
  const midX = (Ax + Bx) / 2;
  const midY = (Ay + By) / 2;

  // Находим угол наклона отрезка AB
  const angle = Math.atan2(By - Ay, Bx - Ax);

  // Находим смещение точки C от середины отрезка AB
  const dx = offset * Math.sin(angle);
  const dy = -offset * Math.cos(angle);

  // Находим координаты точки C
  const Cx = midX + dx;
  const Cy = midY + dy;

  return { x: Cx, y: Cy };
}