using {AdminService, CatalogService} from './services';

annotate AdminService with @(requires: ['admin', 'instructor', 'categoryManager']) ;

annotate AdminService.Courses with @(restrict: [
    {grant: '*' , to: 'admin'},
    {grant: ['READ', 'UPDATE'], to: 'instructor', where: 'instructor.email = $user'},
    {grant : ['READ', 'UPDATE'],  to: 'categoryManager', where: 'category_code = $user.category'}
]) ;


annotate AdminService.Instructors with @(restrict: [
     {grant: '*' , to: 'admin'},
     {grant: ['READ'], to: ['instructor, categoryManager']}
]) ;

annotate AdminService.Participants with @(restrict: [
      {grant: '*' , to: 'admin'},
      {grant: ['READ'], to: ['instructor, categoryManager']}
]) ;

annotate AdminService.Enrollments with @(restrict: [
     {grant: '*' , to: 'admin'},
     {grant: ['READ'], to: 'instructor', where: 'course.instructor.email = $user'},
     {grant: ['READ'], to: 'categoryManager', where: 'course.category_code = $user.category'}
]) ;


annotate CatalogService.Courses with actions {
    enroll @(requires: 'authenticated-user')
} ;

annotate CatalogService.Participants with  @(requires: 'admin');



