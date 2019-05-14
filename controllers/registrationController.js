var Registration = require('../objects/Registration');
var Person = require('../objects/Person');
var Room = require('../objects/Room');

var async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all registrations.
exports.registration_list = function(req, res, next) {
    Registration.find({}, 'guest room checkIn checkOut')
    .populate('guest')
    .populate('room')
    .exec(function (err, list_registrations){
        if (err) { return next(err); }
        res.render('registration_list', {title: 'Registration List', registration_list: list_registrations });
    });
};

// Display detail page for a specific registration.
exports.registration_read = function(req, res, next) {
    async.parallel({
        registration: function(callback) {
            Registration.findById(req.params.id)
            .populate('guest')
            .populate('room')
            .exec(callback)
        },
        guest: function(callback) {
            Person.find({ 'guest': req.params.id })
            .exec(callback);
        },
        room: function(callback) {
            Room.find({ 'room': req.params.id })
            .exec(callback);
        },
    
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.registration==null) {
            var err = new Error('Registration not found');
            err.status = 404;
            return next (err);
        }
        res.render('registration_read', { title: 'Registration Detail', registration: results.registration, guest: results.guest, room: results.room });
    })
};

// Display registration create form on GET.
exports.registration_create_get = function(req, res, next) {
    async.parallel({
        guest: function(callback) {
            Person.find(callback);
        },
        room: function(callback) {
            Room.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('registration_create', { title: 'Create Registration', guests: results.guest, rooms: results.room})
    });
};

//Register an existing Guest on GET
exports.register_guest_get = function(req, res, next) {
    async.parallel({
        room: function(callback) {
            Room.find(callback);
        },
        guest: function(callback) {
            Person.findById(req.params.id, callback);
        },
    }, function(err, results) {
        if (err) { return next(err) };
        if (results.guest==null){
            var err = new Error('Guest not found');
            err.status = 404;
            return next(err);
        };
        res.render('registration_create', {
            title: 'Start returning guest registration', 
            guests: results.guest, 
            rooms: results.room
        })
    });
};

//Register an existing guest on POST.
exports.register_guest_post = [
    body('patient', 'Patient must not be empty.').isLength({ min:1 }).trim(),
    body('patientLoc', 'Patient Location must not be empty.').isLength({ min:1 }).trim(),
    body('staff', 'Staff must not be empty.').isLength({ min:1 }).trim(),
    body('room', 'Room must not be empty.').isLength({ min:1 }).trim(),
    body('checkIn', 'Check In must not be empty.').isLength({ min:1 }).trim(),
    body('numbKeys', 'Number of Keys must not be empty.').isLength({ min: 1}).trim(),
    sanitizeBody('*').trim().escape(),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            async.parallel({
                guest: function(callback) {
                    Person.find(callback)
                },
                room: function(callback) {
                    Room.find(callback)
                }, 
            }, 
            function (err, results) {
                console.log(results);
                if (err) { return next(err) };
                res.render('registration_read', { title: 'Create Registration', guest: results.guest, room: results.room, registration: registration, errors: errors.array() });
            })
            return;
        }
        else {
            var registration = new Registration(
                {
                    guest: req.body.guest,
                    patient: req.body.patient,
                    patientLoc: req.body.patientLoc,
                    staff: req.body.staff,
                    room: req.body.room,
                    checkIn: req.body.checkIn,
                    checkOut: req.body.checkOut,
                    vehicle: req.body.vehicle,
                    plateNum: req.body.plateNum,
                    numbKeys: req.body.numbKeys,
                    loans: req.body.loans,
                    comments: req.body.comments            
                });

            registration.save(function (err, results) {
                console.log(results);
                if (err) { return next(err) };              
                res.redirect(registration.url);
            });
        }
    }
]; 

// Handle registration create on POST.
exports.registration_create_post = [
    body('guest', 'guest must not be empty.').isLength({ min:1 }).trim(),
    body('patient', 'Patient must not be empty.').isLength({ min:1 }).trim(),
    body('patientLoc', 'Patient Location must not be empty.').isLength({ min:1 }).trim(),
    body('staff', 'Staff must not be empty.').isLength({ min:1 }).trim(),
    body('room', 'Room must not be empty.').isLength({ min:1 }).trim(),
    body('checkIn', 'Check In must not be empty.').isLength({ min:1 }).trim(),
    body('numbKeys', 'Number of Keys must not be empty.').isLength({ min: 1}).trim(),
    sanitizeBody('*').trim().escape(),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            async.parallel({
                guest: function(callback) {
                    Person.find(callback)
                },
                room: function(callback) {
                    Room.find(callback)
                }, 
            }, 
            function (err, results) {
                console.log(results);
                if (err) { return next(err) };
                res.render('registration_read', { title: 'Create Registration', guest: results.guest, room: results.room, registration: registration, errors: errors.array() });
            })
            return;
        }
        else {
            var registration = new Registration(
                {
                    guest: req.body.guest,
                    patient: req.body.patient,
                    patientLoc: req.body.patientLoc,
                    staff: req.body.staff,
                    room: req.body.room,
                    checkIn: req.body.checkIn,
                    checkOut: req.body.checkOut,
                    vehicle: req.body.vehicle,
                    plateNum: req.body.plateNum,
                    numbKeys: req.body.numbKeys,
                    loans: req.body.loans,
                    comments: req.body.comments            
                });

            registration.save(function (err, results) {
                console.log(results);
                if (err) { return next(err) };              
                res.redirect(registration.url);
            });
        }
    }
];

// Display registration delete form on GET.
exports.registration_delete_get = function(req, res, next) {
    Registration.findById(req.params.id)
    .populate('guest')
    .populate('room')
    .exec(function (err, registration) {
        if (err) { return next(err); }
        if(registration==null) {
            res.redirect('/users/registration');
        }
        res.render('registration_delete', { title: 'Delete Registration', registration: registration });
    });
};

// Handle registration delete on POST.
exports.registration_delete_post = function(req, res, next) {
    Registration.findByIdAndDelete(req.params.id, function deleteRegistration(err) {
        if (err) { return next(err); }
        res.redirect('/users/registration');
    });
};

// Display registration update form on GET.
exports.registration_update_get = function(req, res, next) {
    async.parallel({ 
        registration:function(callback) {
            Registration.findById(req.params.id)
            .populate('guest')
            .populate('room')
            .exec(callback);
        },
        guest: function(callback) {
            Person.find(callback);
        },
        room: function(callback) {
            Room.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results==null) {
            var err = new Error('Registration not found');
            err.status = 404;
            return next(err);
        }
        res.render('registration_update', { title: 'Update Registration', guests: results.guest, rooms: results.room, registration: results.registration})
    })
};

// Handle registration update on POST.
exports.registration_update_post = [
    body('guest', 'guest must not be empty.').isLength({ min:1 }).trim(),
    body('patient', 'Patient must not be empty.').isLength({ min:1 }).trim(),
    body('patientLoc', 'Patient Location must not be empty.').isLength({ min:1 }).trim(),
    body('staff', 'Staff must not be empty.').isLength({ min:1 }).trim(),
    body('room', 'Room must not be empty.').isLength({ min:1 }).trim(),
    body('checkIn', 'Check In must not be empty.').isLength({ min:1 }).trim(),
    body('numbKeys', 'Number of Keys must not be empty.').isLength({ min: 1}).trim(),
    sanitizeBody('*').trim().escape(),
    
    (req, res, next) => {
        const errors = validationResult(req);
        
        var registration = new Registration(
        {
            guest: req.body.guest,
            patient: req.body.patient,
            patientLoc: req.body.patientLoc,
            staff: req.body.staff,
            room: req.body.room,
            checkIn: req.body.checkIn,
            checkOut: req.body.checkOut,
            vehicle: req.body.vehicle,
            plateNum: req.body.plateNum,
            numbKeys: req.body.numbKeys,
            loans: req.body.loans,
            comments: req.body.comments,
            _id:req.params.id
        });
        if (!errors.isEmpty()) {
            async.parallel({
                guest: function(callback) {
                    Person.find(callback)
                },
                room: function(callback) {
                    Room.find(callback)
                },
                
            }, function (err, results) {
                if (err) { return next(err); }
                res.render('registration_create', { title: 'Create Registration', guests: results.guests, rooms: results.rooms, registration: registration, errors: errors.array() });
            });
            return;
        }
        else {
            Registration.findByIdAndUpdate(req.params.id, registration, {}, function (err, theregistration) {
                if (err) { return next(err); }
                res.redirect(registration.url);
            });
        }
    }
];