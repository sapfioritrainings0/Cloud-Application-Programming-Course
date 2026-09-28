// Create a schema for a training institute. There are multiple courses. 
//Each course is taught by one instructor but one instructor can teach multiple courses.
// There are multiple participants. One participant can enroll in one or more courses. 

namespace training;

entity Courses{
  key ID : UUID;
  title : String(100);
  descr : String(1000);
  startDate : Date;
  endDate : Date;
  seats : Integer;
  seatsBooked : Integer;
  price : Decimal(9, 2);
  currency : String;
}

entity Instructors{
    key ID : UUID;
    name : String(100);
    email : Email;
    bio : String(500);
}

entity Participants{
    key ID : UUID;
    name : String(100);
    email : Email;
    company: String(200);
    address : Address;
}

type Email : String(100) @assert.format : '^[^@]+@[^@]+$' ; // assert.format is for a string validation using RegEx. 

//Structured Type
type Address {
 street : String(100);
 city : String(100);
 postCode : String(6);
 country : String(3);
}

type EnrollmentStatus : String(20) enum {
    confirmed = 'CONFIRMED';
    waitlisted = 'WAITLISTED';
    cancelled = 'CANCELLED';
}