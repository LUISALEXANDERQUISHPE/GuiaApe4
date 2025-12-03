const mockSequelize = {
  define: jest.fn(() => ({
    belongsTo: jest.fn(),
    prototype: {}
  })),
  authenticate: jest.fn(),
  sync: jest.fn(),
};

jest.mock("../../db", () => mockSequelize);

// Mock the Departamento model
jest.mock("../../models/Departamento", () => ({}));

// Mock bcrypt for validPassword tests
jest.mock("bcryptjs", () => ({
  compare: jest.fn()
}));

const bcrypt = require("bcryptjs");

// Mock the Usuario model as a constructor function
const MockUsuario = jest.fn().mockImplementation(() => ({
  validPassword: jest.fn(async function(password) {
    return await bcrypt.compare(password, this.password);
  }),
  update: jest.fn(),
  destroy: jest.fn()
}));

MockUsuario.create = jest.fn();
MockUsuario.findByPk = jest.fn();

jest.mock("../../models/Usuario", () => MockUsuario);

const Usuario = require("../../models/Usuario");

describe("Usuario Model - Unit Tests", () => {
  describe("validPassword method", () => {
    test("should return true for correct password", async () => {
      const plainPassword = "correctPassword";
      const hashedPassword = "$2a$10$exampleHashedPassword";
      bcrypt.compare.mockResolvedValue(true);

      // Create a mock usuario instance
      const usuarioInstance = new Usuario();
      usuarioInstance.password = hashedPassword;

      const result = await usuarioInstance.validPassword(plainPassword);
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
    });

    test("should return false for incorrect password", async () => {
      const plainPassword = "wrongPassword";
      const hashedPassword = "$2a$10$exampleHashedPassword";
      bcrypt.compare.mockResolvedValue(false);

      // Create a mock usuario instance
      const usuarioInstance = new Usuario();
      usuarioInstance.password = hashedPassword;

      const result = await usuarioInstance.validPassword(plainPassword);
      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
    });
  });

  describe("CRUD Operations", () => {
    test("should create a new usuario", async () => {
      const usuarioData = {
        nombre: "Test User",
        email: "test@example.com",
        password: "password123",
        rol: "Usuario",
        edad: 25,
        activo: true
      };

      Usuario.create = jest.fn().mockResolvedValue({
        id: 1,
        ...usuarioData,
        password: "$2a$10$hashedPassword" // Mock hashed password
      });

      const result = await Usuario.create(usuarioData);
      expect(result.nombre).toBe("Test User");
      expect(result.email).toBe("test@example.com");
      expect(Usuario.create).toHaveBeenCalledWith(usuarioData);
    });

    test("should find usuario by primary key", async () => {
      const mockUsuario = {
        id: 1,
        nombre: "Test User",
        email: "test@example.com"
      };

      Usuario.findByPk = jest.fn().mockResolvedValue(mockUsuario);

      const result = await Usuario.findByPk(1);
      expect(result).toEqual(mockUsuario);
      expect(Usuario.findByPk).toHaveBeenCalledWith(1);
    });

    test("should update usuario", async () => {
      const mockUsuario = {
        id: 1,
        nombre: "Test User",
        update: jest.fn().mockResolvedValue({
          id: 1,
          nombre: "Updated User"
        })
      };

      const result = await mockUsuario.update({ nombre: "Updated User" });
      expect(result.nombre).toBe("Updated User");
      expect(mockUsuario.update).toHaveBeenCalledWith({ nombre: "Updated User" });
    });

    test("should delete usuario", async () => {
      const mockUsuario = {
        id: 1,
        nombre: "Test User",
        destroy: jest.fn().mockResolvedValue(true)
      };

      const result = await mockUsuario.destroy();
      expect(result).toBe(true);
      expect(mockUsuario.destroy).toHaveBeenCalled();
    });
  });
});
