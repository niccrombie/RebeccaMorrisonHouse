var Person = require('../objects/Person');
var Donation = require('../objects/Donation');
var Registration = require('../objects/Registration');
var async = require('async');
const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');

// Display list of all persons.

exports.person_list = function(req, res, next) {
    Person.find()
    .sort([['lastName', 'ascending']])
    .exec(function (err, list_guests) {
        if (err) {return next(err)};
        res.render('person_list', { title: 'All Guests', guest_list: list_guests});
    });
    //res.send('NOT IMPLEMENTED: person list');
};

// Display detail page for a specific person.
exports.person_read = function(req, res, next) {
    async.parallel({
        person: function(callback){
            Person.findById(req.params.id)
            .exec(callback);
        },
        donation: function(callback){
            Donation.find({'guest': req.params.id}, ['donationAmount', 'donationType', 'donationDate'])
            .exec(callback);
        },
        registration: function(callback){
            Registration.find({'guest': req.params.id})
            .exec(callback);
        }
    },
        function (err, results) {
            if (err) {return next(err)};
            if (results.person==null) {
                var err = new Error('Guest not found');
                err.status = 404;
                return next(err);
            }
            res.render('person_read', {
                title: 'Guest Details',
                person: results.person,
                donation: results.donation,
                registration: results.registration
            })
        }
    )
};
    
/*
    Person.findById(req.params.id)
        .exec(function(err, results){
            if (err) {return next(err)};
            if (results==null){
                var err = new Error('Guest not found');
                err.status = 404;
                return next(err);
            };
            res.render('person_read', {
                title: 'Guest Details',
                person: results
            })
        })

    //res.send('NOT IMPLEMENTED: person detail: ' + req.params.id);
};
*/
// Display person create form on GET.
exports.person_create_get = function(req, res) {
        res.render('person_create', {
            title: 'New Guest',
        });
    //res.send('NOT IMPLEMENTED: person create GET');
};

// Handle person create on POST.
exports.person_create_post = [
    //Validation
    body('firstName').isLength({min: 1}).trim().withMessage('Missing First Name'),
    body('lastName').isLength({min: 1}).trim().withMessage('Missing Last Name'),
    body('email').isLength({min: 1}).trim().withMessage('Missing Email Address'),
    body('cellPhone').isLength({min: 10}).trim().withMessage('Missing Cell Phone Number'),
    sanitizeBody('*').trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('person_create', {
                title: 'Unable to create new guest',
                errors: errors.array()
            });
            return;
        }
        else {
            var person = new Person({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                homePhone: req.body.homePhone,
                cellPhone: req.body.cellPhone,
                homeAddress: req.body.homeAddress,
                city: req.body.city,
                state: req.body.state,
                zip: req.body.zip,
                emergencyContact: req.body.emergencyContact,
                emergencyPhone: req.body.emergencyPhone
            });
            person.save(function(err, results) {
                console.log(results);
                if (err) {return next(err)};
                res.render('person_read', {
                    title: 'Guest Details',
                    person: results
                })
                //res.redirect(Person.url);  //redirect ????
            });
        }
    }
    //res.send('NOT IMPLEMENTED: person create POST');
];

// Display person delete form on GET.
exports.person_delete_get = function(req, res, next) {
    Person.findById(req.params.id)
    //.populate('person')
    .exec(function(err,results) {
        if (err) {return next(err)};
        if (results==null) {res.redirect('/person')};
        res.render('person_delete', {
            title: 'Delete Guest',
            person: results
        });
    });
    //res.send('NOT IMPLEMENTED: person delete GET');
};

// Handle person delete on POST.
exports.person_delete_post = function(req, res, next) {
    Person.findByIdAndDelete(req.params.id, 
        function deletePerson(err) {
        if (err) return next(err);
        res.redirect('/users/person');
    });
    //res.send('NOT IMPLEMENTED: person delete POST');
};

// Display person update form on GET.
exports.person_update_get = function(req, res,next) {
        Person.findById(req.params.id, function (err, results){
            if(err) {return next(err)};
            if(results == null) {
                res.redirect('/users/person/');
            };
            res.render('person_update', {
                title:'Update Guest Record',
                person: results
            })
        })
    //res.send('NOT IMPLEMENTED: person update GET');
};

// Handle person update on POST.
exports.person_update_post = [
    //Validation
    body('firstName').isLength({min: 1}).trim().withMessage('Missing First Name'),
    body('lastName').isLength({min: 1}).trim().withMessage('Missing Last Name'),
    body('email').isLength({min: 1}).trim().withMessage('Missing Email Address'),
    body('cellPhone').isLength({min: 10}).trim().withMessage('Missing Home Phone Number'),
    sanitizeBody('*').trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            res.render('person_update', {
                title: 'Update Person Failed',
                _id: person.id,
                person: person,
                errors: errors.array(),
            });
        return;
        }
        else {
            var person = new Person({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                homePhone: req.body.homePhone,
                cellPhone: req.body.cellPhone,
                homeAddress: req.body.homeAddress,
                city: req.body.city,
                state: req.body.state,
                zip: req.body.zip,
                emergencyContact: req.body.emergencyContact,
                emergencyPhone: req.body.emergencyPhone,
                _id: req.params.id
            });
            Person.findByIdAndUpdate(req.params.id, person, {}, function (err, person) {
                console.log(person);
                if (err) {return next(err)}
                //res.render('person_read', {title: 'Guest Details', person: person}) // render Not working
                res.redirect(person.url); //redirect not working???
            })
        };
    }
    //res.send('NOT IMPLEMENTED: person update POST');
];

//Search for returning guest
exports.person_search = (function myFunction() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("Person");
    filter = input.value.toUpperCase();
    ul = document.getElementById("myUL");
    li = ul.getElementsByTagName("li");
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
});
