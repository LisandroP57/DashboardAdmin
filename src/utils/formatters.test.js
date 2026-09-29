import { formatCurrency, formatPercent, getInitials } from "./formatters";

describe("formatters", () => {
  it("formatea moneda en pesos argentinos sin decimales", () => {
    const text = formatCurrency(1500);
    expect(text).toMatch(/1\.500/);
    expect(text).toContain("$");
  });

  it("tolera valores inválidos", () => {
    expect(formatCurrency(undefined)).toMatch(/0/);
  });

  it("formatea variaciones porcentuales con signo", () => {
    expect(formatPercent(12.34)).toBe("+12,3%");
    expect(formatPercent(-5)).toBe("-5%");
    expect(formatPercent(null)).toBe("—");
  });

  it("obtiene las iniciales", () => {
    expect(getInitials("ana", "pérez")).toBe("AP");
    expect(getInitials("", "")).toBe("?");
  });
});
