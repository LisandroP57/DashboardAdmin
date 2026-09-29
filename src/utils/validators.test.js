import {
  validateEmail,
  validateLogin,
  validatePassword,
  validateProduct,
  validateRegister,
} from "./validators";

describe("validateEmail", () => {
  it("acepta emails válidos", () => {
    expect(validateEmail("ana@example.com")).toBeNull();
    expect(validateEmail("  ana.perez+tienda@mail.co  ")).toBeNull();
  });

  it("rechaza vacíos y formatos inválidos", () => {
    expect(validateEmail("")).toBe("Campo obligatorio");
    expect(validateEmail("ana@")).toBe("Ingresá un email válido");
    expect(validateEmail("ana@example")).toBe("Ingresá un email válido");
    expect(validateEmail("ana perez@example.com")).toBe("Ingresá un email válido");
  });
});

describe("validatePassword", () => {
  it("exige largo mínimo, letras y números", () => {
    expect(validatePassword("")).toBe("Campo obligatorio");
    expect(validatePassword("abc123")).toBe("Debe tener al menos 8 caracteres");
    expect(validatePassword("solotexto")).toBe("Debe incluir letras y números");
    expect(validatePassword("12345678")).toBe("Debe incluir letras y números");
    expect(validatePassword("Clave1234")).toBeNull();
  });
});

describe("validateLogin", () => {
  it("devuelve errores por campo", () => {
    expect(validateLogin({ email: "", password: "" })).toEqual({
      email: "Campo obligatorio",
      password: "Campo obligatorio",
    });
    expect(validateLogin({ email: "a@b.com", password: "x" })).toEqual({});
  });
});

describe("validateRegister", () => {
  const valid = {
    name: "Ana",
    lastName: "Pérez",
    email: "ana@example.com",
    password: "Clave1234",
    confirmPassword: "Clave1234",
    terms: true,
  };

  it("acepta datos correctos", () => {
    expect(validateRegister(valid)).toEqual({});
  });

  it("detecta contraseñas distintas y términos sin aceptar", () => {
    const errors = validateRegister({ ...valid, confirmPassword: "Otra1234", terms: false });
    expect(errors.confirmPassword).toBe("Las contraseñas no coinciden");
    expect(errors.terms).toBeTruthy();
  });

  it("marca los campos obligatorios vacíos", () => {
    const errors = validateRegister({ ...valid, name: " ", lastName: "" });
    expect(Object.keys(errors).sort()).toEqual(["lastName", "name"]);
  });
});

describe("validateProduct", () => {
  const valid = { name: "Mate", sku: "", category: "home", price: "1500", stock: "10", description: "" };

  it("acepta un producto correcto (valores como texto de formulario)", () => {
    expect(validateProduct(valid)).toEqual({});
  });

  it("no toma un precio o stock vacío como 0", () => {
    const errors = validateProduct({ ...valid, price: "", stock: "" });
    expect(errors.price).toBe("Campo obligatorio");
    expect(errors.stock).toBe("Campo obligatorio");
  });

  it("rechaza precios negativos, stock decimal y categorías inexistentes", () => {
    const errors = validateProduct({ ...valid, price: "-1", stock: "2.5", category: "otra" });
    expect(errors.price).toBeTruthy();
    expect(errors.stock).toBeTruthy();
    expect(errors.category).toBeTruthy();
  });

  it("valida el formato del SKU cuando se completa", () => {
    expect(validateProduct({ ...valid, sku: "ab" }).sku).toBeTruthy();
    expect(validateProduct({ ...valid, sku: "SKU-2001" }).sku).toBeUndefined();
  });
});
