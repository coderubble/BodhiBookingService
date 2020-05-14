const request = require("supertest");
const axios = require("axios");
const MockAdapter = require("axios-mock-adapter");
const app = require("../src/app");
const models = require("../src/models");
const constants = require("../src/constants/constants");
const { BOOKED, PENDING, BLOCKED, OPEN, CANCELLED } = constants.status
const { CLINIC_ADMIN, CLINIC_USER, PATIENT } = constants.roles;

const bookingData = {
  patient_email_id: "patient@bodhi.com",
  clinic_id: "12345",
  doctor_id: "d123",
  time_slot: "11:30",
  status: BOOKED
}

const bookingData1 = {
  patient_email_id: "patient@bodhi.com",
  clinic_id: "12345",
  doctor_id: "d123",
  time_slot: "10:00",
  status: BOOKED
}

const bookingData2 = {
  patient_email_id: "patient2@bodhi.com",
  clinic_id: "12345",
  doctor_id: "d123",
  date: "2000-01-01",
  time: "14:00",
  status: BOOKED
}

const bookingData3 = {
  patient_email_id: "",
  clinic_id: "12345",
  doctor_id: "d123",
  date: "2000-01-01",
  time: "14:00",
  status: OPEN
}

var mock = new MockAdapter(axios);

describe("Booking Service", () => {
  beforeAll(async () => {
    await request(app).get(`${process.env.API_PREFIX}/health`).send();
  })
  afterAll(async (done) => {
    await models.sequelize.close();
    await app.close;
    done();
  });

  it("Create Booking Success", async (done) => {
    mock.onGet(`${process.env.USERSERVICE_URL}/user`).reply(200, {
      "email_id": "patient@bodhi.com",
      "user_type": "P",
      "clinic_id": null
    });
    const res = await request(app)
      .post(`${process.env.API_PREFIX}/booking`).send(bookingData)
      .set("authorization", '123');
    expect(res.statusCode).toEqual(201);
    done();
  });

  it("Create Booking Failure", async (done) => {
    mock.onGet(`${process.env.USERSERVICE_URL}/user`).reply(200, {
      "email_id": "trump@usa.com",
      "user_type": "S",
      "clinic_id": null
    });
    const res = await request(app)
      .post(`${process.env.API_PREFIX}/booking`).send(bookingData)
      .set("authorization", '123');
    expect(res.statusCode).toEqual(403);
    expect(res.text).toEqual('Unauthorized to create Booking');
    done();
  });

  it("Already Booked", async (done) => {
    mock.onGet(`${process.env.USERSERVICE_URL}/user`).reply(200, {
      "email_id": "patient@bodhi.com",
      "user_type": "P",
      "clinic_id": null
    });

    const res1 = await request(app)
      .post(`${process.env.API_PREFIX}/booking`).send(bookingData)
      .set("authorization", '123');
    console.log(`Res1:${JSON.stringify(res1)}`);

    expect(res1.statusCode).toEqual(403);
    done();
  });

  it("Cancel Booking Success", async (done) => {
    mock.onGet(`${process.env.USERSERVICE_URL}/user`).reply(200, {
      "email_id": "patient@bodhi.com",
      "user_type": "P",
      "clinic_id": null
    });
    const res2 = await request(app)
      .put(`${process.env.API_PREFIX}/booking`).send(bookingData)
      .set("authorization", '123');
    console.log(`Cancel response:${JSON.stringify(res2)}`);
    expect(res2.statusCode).toEqual(201);
    done();
  });

  it("Cancel Booking Failure", async (done) => {
    mock.onGet(`${process.env.USERSERVICE_URL}/user`).reply(200, {
      "email_id": "patient@bodhi.com",
      "user_type": "P",
      "clinic_id": null
    });
    const res3 = await request(app)
      .put(`${process.env.API_PREFIX}/booking`).send(bookingData1)
      .set("authorization", '123');
    console.log(`Cancel Failure response:${JSON.stringify(res3)}`);
    expect(res3.statusCode).toEqual(403);
    expect(res3.text).toEqual("Booking not found");
    done();
  });

  it("Create Booking Success another patient", async (done) => {
    mock.onGet(`${process.env.USERSERVICE_URL}/user`).reply(200, {
      "email_id": "patient2@bodhi.com",
      "user_type": "P",
      "clinic_id": null
    });
    const res2 = await request(app)
      .post(`${process.env.API_PREFIX}/booking`).send(bookingData2)
      .set("authorization", '123');
    console.log(`Res2:${JSON.stringify(res2)}`);
    expect(res2.statusCode).toEqual(201);
    done();
  });

  it("View All Bookings", async (done) => {
    mock.onGet(`${process.env.USERSERVICE_URL}/user`).reply(200, {
      "email_id": "clinic_admin@bodhi.com",
      "user_type": CLINIC_USER,
      "clinic_id": "12345"
    });
    const res4 = await request(app)
      .get(`${process.env.API_PREFIX}/booking/2000-01-01?from=0&to=20`);
    console.log(`View booking,clinic:${JSON.stringify(res4)}`);
    expect(res4.statusCode).toEqual(200);
    // const result = JSON.parse(res4.text).rows;
    //console.log(`Result:${JSON.stringify(result)}`);
    // expect(result).toEqual(bookingData1);

    // mock.onGet(`${process.env.USERSERVICE_URL}/user`).reply(200, {
    //   "email_id": "patient1@bodhi.com",
    //   "user_type": PATIENT,
    //   "clinic_id": "null"
    // });
    // const res5 = await request(app)
    //   .get(`${process.env.API_PREFIX}/booking/2000-01-01?from=0&to=20`);
    // console.log(`View Booking,Patient2:${JSON.stringify(res5)}`);
    // expect(res5.statusCode).toEqual(200);
    // const bookings = JSON.parse(res5.text).rows;
    // if (bookings.length) {
    //   console.log(`Result:${JSON.stringify(bookings)}`);
    //   result = bookings.map(b => b);
    //  // expect(result).toEqual(expect.array)
    // }
    // else {
    //   console.log('No bookings to view');

    // }
    done();
  });

  // it("View All Bookings Failure", async (done) => {
  //   mock.onGet(`${process.env.USERSERVICE_URL}/user`).reply(200, {
  //     "email_id": "clinic_admin@bodhi.com",
  //     "user_type": PATIENT,
  //     "clinic_id": "12345"
  //   });
  //   const res4 = await request(app)
  //     .get(`${process.env.API_PREFIX}/booking/2000-01-01?from=0&to=20`);
  //   expect(res4.statusCode).toEqual(400);
  //   done();
  // });

  it("Load Schedule", async (done) => {
    mock.onGet(`${process.env.CLINICSERVICE_URL}/clinic/schedule/12345/d123`).reply(200, {
      "_id": "12345",
      "joining_date": "2020-05-12T00:00:00.000Z",
      "schedule": "*/15 8-16 * * 1-5"
    });
    const res4 = await request(app)
      .post(`${process.env.API_PREFIX}/booking/createSchedule/12345/d123/2020-05-14`)
      .send(bookingData2)
    expect(res4.statusCode).toEqual(200);
    done();
  })
});