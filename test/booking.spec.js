
const request = require("supertest");
const db = require("../src/db/booking.db")
const sinon = require("sinon");
const { Sequelize } = require("sequelize");
const sequalize = new Sequelize('sqlite::memory:');
sinon.stub(db, "sequelize").returns(new Sequelize('sqlite::memory:'));
const app = require("../src/app"); // This line must be after the sequalize stub creation.
const Booking = require("../src/models/booking.model");
const { BOOKED, PENDING, BLOCKED, OPEN } = require("../src/constants/constants")

const bookingData = {
  patient_email_id: "patient@bodhi.com",
  clinic_id: "12345",
  doctor_id: "d123",
  date: "2000-01-01",
  time: "11:30",
  status: BOOKED
}

const bookingData1 = {
  patient_email_id: "patient1@bodhi.com",
  clinic_id: "12345",
  doctor_id: "d123",
  date: "2000-01-01",
  time: "10:00",
  status: BOOKED
}

describe("Booking Service", () => {
  let server;
  beforeAll((done) => {
    Booking.sync().then(() => {
      server = app.listen(async () => {
        global.agent = request.agent(server);
        done();
      });
    })
  });

  afterAll(async () => {
    await server.close();
    await sequalize.close();
  });

  test("Create Booking Success", async () => {
    const res = await request(app)
      .post(`${process.env.API_PREFIX}/booking`).send(bookingData);
    expect(res.status).toEqual(201);
  });

  test("Already Booked", async () => {
    const res1 = await request(app)
      .post(`${process.env.API_PREFIX}/booking`).send(bookingData);
    console.log(`Res1:${JSON.stringify(res1)}`);
    expect(res1.statusCode).toEqual(403);
  });

  test("Cancel Booking Success", async () => {
    const res2 = await request(app)
      .put(`${process.env.API_PREFIX}/booking`).send(bookingData);
    console.log(`Cancel response:${JSON.stringify(res2)}`);
    expect(res2.statusCode).toEqual(201);
  });

  test("Cancel Booking Failure", async () => {
    const res3 = await request(app)
      .put(`${process.env.API_PREFIX}/booking`).send(bookingData1);
    console.log(`cancel response:${JSON.stringify(res3)}`);
    expect(res3.statusCode).toEqual(403);
    expect(res3.text).toEqual("Booking not found");
  });
});
