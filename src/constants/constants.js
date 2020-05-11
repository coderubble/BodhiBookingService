const status = {
  BOOKED: 'BOOKED',
  PENDING: 'PENDING',
  BLOCKED: 'BLOCKED',
  OPEN: 'OPEN',
  CANCELLED: 'CANCELLED'
}
const roles = {
  CLINIC_ADMIN: 'A',
  CLINIC_USER: 'U',
  SYSTEM_ADMIN: 'S',
  PATIENT: 'P'
}
module.exports = { status, roles };