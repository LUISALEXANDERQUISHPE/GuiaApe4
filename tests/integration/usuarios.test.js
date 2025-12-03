const request = require('supertest');
const express = require('express');

// Mock the database and models
jest.mock('../../db', () => ({
  authenticate: jest.fn(),
  sync: jest.fn(),
  transaction: jest.fn(() => ({
    commit: jest.fn(),
    rollback: jest.fn()
  })),
  query: jest.fn()
}));

jest.mock('../../models/Usuario', () => {
  const mockUsuario = {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    belongsTo: jest.fn()
  };
  return mockUsuario;
});

jest.mock('../../models/Departamento', () => ({}));
jest.mock('../../models/RefreshToken', () => ({}));
jest.mock('../../middlewares/auth', () => ({
  verificarToken: (req, res, next) => next(), // Mock to bypass auth
  permitirRoles: () => (req, res, next) => next()
}));

const app = require('../../server');

describe('Integration Tests - /usuarios endpoint', () => {
  beforeAll(async () => {
    // Sync the database if needed
  });

  afterAll(async () => {
    // Close connections if needed
  });

  test('GET /usuarios should respond correctly', async () => {
    const Usuario = require('../../models/Usuario');

    // Mock the response data
    const mockData = {
      rows: [
        { id: 1, nombre: 'Test User', email: 'test@example.com', rol: 'Usuario', edad: 25, activo: true }
      ],
      count: 1
    };

    Usuario.findAndCountAll.mockResolvedValue(mockData);

    const response = await request(app)
      .get('/usuarios')
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total');
    expect(response.body).toHaveProperty('page');
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeGreaterThan(0);
  });
});
