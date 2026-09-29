using training as db from '../db/schema';

// service CourseService @(path: '/courses'){ // change the path of the API
//    @readonly entity Courses as projection on db.Courses;
//     entity Instructors as projection on db.Instructors;
//     entity Participants as projection on db.Participants;
//     entity Enrollments as projection on db.Enrollments;
// }

// if you want to exclude some field from the entity in all CRUD ops
// service UserService{
//     entity Courses as projection on db.Courses
//     excluding {
//         createdAt, createdBy, modifiedAt, modifiedBy
//     };
// }




// if you want a specific inclusion list
// service UserService{
//      entity Instructors as projection on db.Instructors{
//         ID, name, bio
//      }
// }



// if include everything and extend as well
// service UserService{
//  entity Courses as projection on db.Courses {
//     *,
//     seats - seatsBooked as seatsAvailable : Integer,
//     instructor.name as instructorName,
//     category.name as categoryName
//  }
// }


//it requires a role to access this particular service
service AdminService  @(
    requires : 'admin'
){
    entity Courses as projection on db.Courses;
     entity Instructors as projection on db.Instructors;
    entity Participants as projection on db.Participants;
    entity Enrollments as projection on db.Enrollments;

}


service CatalogService{
   @readonly entity Courses as projection on db.Courses{
    *, 
        seats - seatsBooked as seatsAvailable : Integer,
    instructor.name as instructorName,
    category.name as categoryName
   }

//declare a function in a servuce
   function availableSeats(course: UUID) returns Integer;

//declare an action inside a service
   extend projection Courses with actions{
    action enroll(partipant: UUID) returns String;
   }
   
}