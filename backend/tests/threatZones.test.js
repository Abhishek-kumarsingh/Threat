const request = require('supertest');
const app = require('../app'); // Adjust the path to your app file

describe('Threat Zones API', () => {
    describe('GET /api/threat-zones', () => {
        it('should return a list of threat zones', async () => {
            const response = await request(app).get('/api/threat-zones');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('POST /api/threat-zones', () => {
        it('should create a new threat zone', async () => {
            const newThreatZone = { name: 'Zone A', level: 'High' };
            const response = await request(app)
                .post('/api/threat-zones')
                .send(newThreatZone);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe(newThreatZone.name);
            expect(response.body.level).toBe(newThreatZone.level);
        });
    });

    describe('PUT /api/threat-zones/:id', () => {
        it('should update an existing threat zone', async () => {
            const updatedThreatZone = { name: 'Zone B', level: 'Medium' };
            const response = await request(app)
                .put('/api/threat-zones/1') // Replace with a valid ID
                .send(updatedThreatZone);
            expect(response.status).toBe(200);
            expect(response.body.name).toBe(updatedThreatZone.name);
            expect(response.body.level).toBe(updatedThreatZone.level);
        });
    });

    describe('DELETE /api/threat-zones/:id', () => {
        it('should delete a threat zone', async () => {
            const response = await request(app).delete('/api/threat-zones/1'); // Replace with a valid ID
            expect(response.status).toBe(204);
        });
    });
});