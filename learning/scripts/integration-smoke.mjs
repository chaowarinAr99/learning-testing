import assert from 'node:assert/strict';

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';

async function request(method, path, body, headers = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  const json = text ? JSON.parse(text) : null;

  return { response, json };
}

const created = await request('POST', '/enrollments', {
  employeeId: 'EMP900',
  courseId: 'PHY001',
});

assert.equal(created.response.status, 201);
assert.match(created.json.enrollmentId, /^ENR\d{3}$/);
assert.equal(created.json.employeeId, 'EMP900');
assert.equal(created.json.courseId, 'PHY001');
assert.equal(created.json.status, 'PENDING_APPROVAL');

const enrollmentId = created.json.enrollmentId;

const approved = await request('PATCH', `/enrollments/${enrollmentId}/approve`, {
  approvedBy: 'HR900',
});

assert.equal(approved.response.status, 200);
assert.equal(approved.json.enrollmentId, enrollmentId);
assert.equal(approved.json.status, 'APPROVED');
assert.equal(approved.json.approvedBy, 'HR900');
assert.match(approved.json.approvedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/);

const certificate = await request('POST', `/enrollments/${enrollmentId}/certificate`, {
  progress: 100,
});

assert.equal(certificate.response.status, 200);
assert.equal(certificate.json.enrollmentId, enrollmentId);
assert.equal(certificate.json.certificateStatus, 'CERTIFICATE_ISSUED');
assert.equal(certificate.json.certificate.certificateId, `CERT-${enrollmentId}`);
assert.equal(
  certificate.json.certificate.certificateUrl,
  `https://certificate.example.com/${enrollmentId}.pdf`,
);
assert.match(
  certificate.json.certificate.issuedAt,
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/,
);

console.log(`Integration smoke passed for ${enrollmentId}`);
