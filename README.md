# BodhiBookingService
Manage Booking details

This Service is used to manage booking details of Bodhi application.

#sequelize-cli commands
```
 npx sequelize-cli init  

 --> create following folders:
config, contains config file, which tells CLI how to connect with database
models, contains all models for your project
migrations, contains all migration files
seeders, contains all seed files



```
## Sample Booking request
#### Create Booking:
```
     { 
        "patient_email_id": "patient1@usa.com",   
        "clinic_id":"5ebba903f8d5c4bd90cfee4a",
        "doctor_id":"5ebba903f8d5c4bd90cfee4b",
        "time_slot": "2020-05-14 22:00:00+00",
        "status":"BOOKED"
    }
```