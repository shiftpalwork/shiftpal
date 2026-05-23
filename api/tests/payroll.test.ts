import { calculateHours } from "../src/routes/payroll";

describe("calculateHours", () => {
  it("calculates decimal payable hours", () => {
    expect(calculateHours("2026-01-01T08:00:00.000Z", "2026-01-01T16:30:00.000Z")).toBe(8.5);
  });
});
