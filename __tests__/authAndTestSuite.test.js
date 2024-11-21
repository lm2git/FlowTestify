const request = require('supertest');
const app = require('../server'); // Assicurati che il server venga esportato correttamente
const User = require('../models/User');
const Test = require('../models/Test');

describe('Auth and Test Management Routes', () => {
  let token;
  let userId;
  let testId;

  // Cleanup after each test to ensure clean state for subsequent tests
  afterEach(async () => {
    await User.deleteMany({});
    await Test.deleteMany({});
  });

  // Test: Creazione di un nuovo utente
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        username: 'testuser',
        password: 'testpassword',
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('User created successfully');

    const user = await User.findOne({ username: 'testuser' });
    userId = user._id.toString();
  });

  // Test: Login con l'utente appena creato
  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        username: 'testuser',
        password: 'testpassword',
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  // Test: Ricerca dei test (senza test creati, dovrebbe essere vuoto)
  it('should return an empty list of tests for a tenant', async () => {
    const res = await request(app)
      .get(`/api/tests/tenant1`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  // Test: Creazione di un nuovo test
  it('should create a new test', async () => {
    const res = await request(app)
      .post('/api/tests')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tenantId: 'tenant1',
        name: 'Test 1',
        steps: [{ step: 'Step 1', details: {} }],
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Test created successfully');
    expect(res.body.test).toHaveProperty('_id');
    
    testId = res.body.test._id;
  });

  // Test: Verifica che il test appena creato sia presente
  it('should retrieve tests for a tenant', async () => {
    const res = await request(app)
      .get(`/api/tests/tenant1`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0); // Almeno un test dovrebbe essere presente
  });

  // Test: Cancellazione di un test
  it('should delete a test', async () => {
    const res = await request(app)
      .delete(`/api/test/${testId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Test deleted successfully');
  });

  // Test: Verifica che il test sia stato cancellato
  it('should return 404 when trying to retrieve a deleted test', async () => {
    const res = await request(app)
      .get(`/api/test/${testId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Test not found');
  });
});
