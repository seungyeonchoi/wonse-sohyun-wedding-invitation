/**
 * A heart drawn from its implicit curve (x² + y² − 1)³ − x²y³ ≤ 0, for the developer console
 * and the `curl` invitation. Terminal cells are about twice as tall as wide, hence width ≈ 2.3 × height.
 */
export function asciiHeart(width = 35, height = 14, fill = "*") {
  const rows: string[] = [];
  for (let j = 0; j < height; j++) {
    const y = 1.22 - (j / (height - 1)) * 2.28;
    let row = "";
    for (let i = 0; i < width; i++) {
      const x = -1.25 + (i / (width - 1)) * 2.5;
      const a = x * x + y * y - 1;
      row += a * a * a - x * x * y * y * y <= 0 ? fill : " ";
    }
    rows.push(row.trimEnd());
  }
  return rows.filter((r) => r.trim()).join("\n");
}
