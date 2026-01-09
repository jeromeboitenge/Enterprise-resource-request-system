import request from "supertest";
import app from '../src/app'

describe('app test', () => {
    it('gh', async () => {
        const res = await request(app).get('/unknown')
        expect(res.status).toBe(404)

    })

})