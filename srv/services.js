const cds = require('@sap/cds');
const { SELECT, UPDATE } = require('@sap/cds/lib/ql/cds-ql');

module.exports = class CatalogService extends cds.ApplicationService {
    init()
    {
        const {Courses, Participants} = this.entities;  // destructuring 



        // =================================== 1. after READ : Compute almostFull field with logic ===========================//
        this.after('READ', Courses, rows => {
            for(const c of [rows].flat().filter(Boolean))
            {
                if(c.seatsAvailable!=null)
                {
                    c.almostFull = c.seatsAvailable>0 && c.seatsAvailable<=3 ;
                }
            }
        });



        // =================================== 2. create a validation that end date should be greater than the start date======================//
        // one more validation that seats field should be present and greater than 0. 
        this.before('CREATE', Courses, req => {
            const { seats, startDate, endDate} = req.data;

            // seats validation
            if(startDate && endDate && (new Date(startDate) > new Date(endDate)))
                req.error(400, 'End Date must be greater than the Start date');

             if(seats == null || seats<=0)
                req.error(400, 'SEATS_CHECK', 'seats');

           
        });


        // ================================== 3. before handler to transform the name and the email for the Participants==============================//

        this.before(['CREATE', 'UPDATE'], Participants, req=> {
            const data = req.data;
            if(data.name)
                data.name = data.name.trim().replace(/\s+/g, ' ');

            if(data.email)
                data.email = data.email.trim().toLowerCase();

        });


        // ================================ 4. To update the seats in an already existing course - check if the seats are not less than the seats booked=========//
        this.before('UPDATE', Courses, async req =>{
            const {seats} = req.data;

            if(seats === null)
                return ;

            const current = await SELECT.one.from('training.Courses').columns('seatsBooked', 'title').where({ID : req.params[0].ID})
            if(current && seats <current.seatsBooked )
                req.reject(400,'UPDATE_SEATS', [seats, current.seatsBooked, current.title] );
        });




        // ===================== 5. Before cancellation of a Course, check if there are any enrollments =======================

        this.before('DELETE', Courses, async req=> {
            const courseID = req.params[0].ID;

            const enrollments = await SELECT.from('training.Enrollments').where({course_ID : courseID});

            if(enrollments.length>0)
            {
                req.reject(409, `Cannot remove the course : ${enrollments.length} participant(s) are enrolled. Cancel the enrollments first`);
            }
        });

        // ====================== 6. on Action - enroll logic for Courses =====================================//

        this.on('enroll', async req=> {
            const courseID = req.params[0].ID;
            const { participant } = req.data;

            //validation 1 : to check if the course exists or not
            const course = await SELECT.one.from('training.Courses').where({ID : courseID});
            if(!course)
            {
                return req.error(404, `Course ${courseID} not found`);
            }

            // validation 2 : check if the seats are available in the course
            const leftSeats = course.seats - course.seatsBooked ;
            // we can use this as well - course.seatsAvailable

            if(leftSeats<=0)
                return req.error(409, `Course ${course.title} is full`); 
            // your assignment - in this case, dont give the error, just put the candidate as a waitlisted candidate


            //validation 3 : if the participant already exists in the course
            const exists = await SELECT.one.from('training.Enrollments').where({course_ID :courseID, participant_ID: participant});
            console.log("exists object: "+ exists);
            if(exists)
                return req.error(409, 'Participant is already enrolled in this course');


            await INSERT.into('training.Enrollments').entries({
                course_ID : courseID, participant_ID: participant, status: 'CONFIRMED'
            });

            await UPDATE('training.Courses', courseID).with({seatsBooked: {'+=' : 1}});
            // UPDATE('training.Courses').set({seatsBooked: {'+=' : 1}}).where({ID: courseID})

            const text = cds.i18n.messages.at('ENROLLED_SEATS', [leftSeats-1, course.title]);
            return text;
            //return `Enrolled - ${leftSeats-1} seat(s) are remaining on the course ${course.title}` ;
        });


        // =========================== 7. on Fucntion - read only calculation for available seats ============================//
        this.on('availableSeats' , async req=> {
            const {course} = req.data;

            const row = await SELECT.one.from('training.Courses').where({ID: course});

            if(!row)
                return req.error(404, 'Course not found');

            return row.seats - row.seatsBooked;
        })

        super.init();
    }



}

///
// SWAPNIL               GARG
// SWAPNIL GARG
// ASHA KUMAR SINGH

/*

{
"participant" : "UUID",
"status" : "WAITLISTED"
}


*/