import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 },   // Ramp to 100 users
    { duration: '3m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 200 },   // Ramp to 200 users
    { duration: '3m', target: 200 },   // Stay at 200 users
    { duration: '1m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.1'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api/v1';
let authToken = '';

export function setup() {
  const loginRes = http.post(`${BASE_URL}/auth/signin`, JSON.stringify({
    email: 'test@ventureflow.io',
    password: 'TestPassword123!',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  authToken = loginRes.json('accessToken');
  return { token: authToken };
}

export default function (data) {
  authToken = data.token;

  group('Dashboard', () => {
    const dashRes = http.get(`${BASE_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    check(dashRes, {
      'Dashboard load successful': (r) => r.status === 200,
      'Dashboard response time < 200ms': (r) => r.timings.duration < 200,
    });
  });

  sleep(1);

  group('Investors Search', () => {
    const investorsRes = http.get(`${BASE_URL}/investors?page=1&pageSize=20`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    check(investorsRes, {
      'Investors list loaded': (r) => r.status === 200,
      'Investors response < 500ms': (r) => r.timings.duration < 500,
      'Has pagination': (r) => r.json('pagination') !== null,
    });
  });

  sleep(1);

  group('Startups CRUD', () => {
    const startupsRes = http.get(`${BASE_URL}/startups?page=1`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    check(startupsRes, {
      'Startups loaded': (r) => r.status === 200,
      'Startups response < 500ms': (r) => r.timings.duration < 500,
    });
  });

  sleep(1);

  group('Pipeline Operations', () => {
    const pipelineRes = http.get(`${BASE_URL}/crm/pipeline?startupId=startup_1`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    check(pipelineRes, {
      'Pipeline loaded': (r) => r.status === 200,
      'Pipeline response < 300ms': (r) => r.timings.duration < 300,
    });
  });

  sleep(1);

  group('AI Matching', () => {
    const matchRes = http.get(`${BASE_URL}/matching/investors/startup/startup_1`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    check(matchRes, {
      'AI Matching works': (r) => r.status === 200,
      'Matching response < 1000ms': (r) => r.timings.duration < 1000,
    });
  });

  sleep(2);
}
