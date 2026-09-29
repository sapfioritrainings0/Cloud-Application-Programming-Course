// Create a schema for a training institute. There are multiple courses. 
//Each course is taught by one instructor but one instructor can teach multiple courses.
// There are multiple participants. One participant can enroll in one or more courses. 
// One course can have multiple participants

namespace training;

using {cuid, managed, sap.common.CodeList, Currency} from '@sap/cds/common';

//@cds.search: { descr : false}
entity Courses : cuid, managed {
//  key ID : UUID;
  title : String(100) @mandatory;
  descr : String(1000);
  startDate : Date;

  endDate : Date;
  seats : Integer @assert.range: [1,500];
  seatsBooked : Integer default 0;
 //  seatsLeft : Integer = seats - seatsBooked stored;  //calculated element
  price : Decimal(9, 2);
 // currency : String;
 currency : Currency;
  // @Common.Text : instructor.name
  instructor : Association to Instructors  @assert.target;
  enrollments : Composition of many Enrollments on enrollments.course = $self;
  category : Association to Categories;
  
}

entity Instructors : cuid, managed{
   // key ID : UUID;
    name : String(100);
    email : Email;
    bio : String(500);
    courses : Association to many Courses on courses.instructor = $self;
}

entity Participants : cuid, managed{
  //  key ID : UUID;
    name : String(100);
    email : Email;
    company: String(200);
    address : Address;
    enrollments : Association to many Enrollments on enrollments.participant = $self;
//   address : {
//      street : String(100);
//  city : String(100);
//  postCode : String(6);
//  country : String(3);
  //}
}

// entity created for handling many to many relationship
entity Enrollments : cuid, managed {
  //   key ID : UUID;
    course : Association to Courses;
    participant : Association to Participants;
    status : EnrollmentStatus default 'CONFIRMED';
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

//codelist - Category
entity Categories : CodeList {
    key code : String(20);
}

// entity Employee {
//     firstName : String(100);
//     lastName : String(100);
//     name : String = firstName || ' ' || lastName; // calculated element
// }


// default keyword
// entity Foo {
//     variable : String default 'test';
// }

//aspects
// aspect managed{
//     createdAt : DateTime;
//     createdBy : String;
//     modifiedAt : DateTime;
//     modifiedBy : String;

// }

//use extend keyword for an aspect
//extend Courses with managed;

// use : for an aspect