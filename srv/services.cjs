const cds = require('@sap/cds');
const { SELECT } = require('@sap/cds/lib/ql/cds-ql');

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
                req.reject(400, 'End Date must be greater than the Start date');

             if(seats == null || seats<=0)
                req.error(400, 'Seats are mandatory to create a course', 'seats');

           
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
                req.reject(400, `Cannot readuce seats to ${seats} : ${current.seatsBooked} seats already booked on course ${current.title}`);
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

        super.init();
    }



}

///
// SWAPNIL               GARG
// SWAPNIL GARG
// ASHA KUMAR SINGH


