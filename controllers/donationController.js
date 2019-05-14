var Donation = require('../objects/Donation');
var Person = require('../objects/Person');

var async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all donations.
exports.donation_list = function(req, res, next) {
    Donation.find({}, 'guest donationType donationDate donationAmount')
    .populate('guest')
    .sort([['lastName', 'ascending']])
    .exec(function (err, list_donations) {
        if (err) {return next(err)};
        res.render('donation_list', { title: 'Donation List', donation_list: list_donations});
    });
// res.send('NOT IMPLEMENTED: donation list');
};

// Display detail page for a specific donation.
exports.donation_read = function(req, res, next) {
    async.parallel({
        donation: function(callback) {
            Donation.findById(req.params.id)
            .populate('guest')
            .exec(callback)
        },
        guest: function(callback) {
            Person.find({ 'guest': req.params.id })
            .exec(callback);
        },
    },
        function (err, results) {
            if (err) {return next(err)};
            if (results.donation == null) {
                var err = new Error('Donation not found');
                err.status = 404;
                return next(err)
            };
            console.log(results);
            res.render('donation_read', { 
                title: "Donation Details", 
                donation: results.donation,
                guest: results.guest,

            })
        })
    // res.send('NOT IMPLEMENTED: donation detail: ' + req.params.id);
};
// Display donation create form on GET.
///////////////////////////////////////NOT IN USE
exports.donation_create_get = function(req, res, next) {

    //async.parallel({
    //    guest: function(callback) {
    //        Person.find(callback);        
    //    },
    //    function (err, results) {
    //        if (err) {return next(err);}
    //        console.log(results);
            res.render('donation_create', {
                title: 'New Donation',
    //            guests: results.guest               
    //        });
    //    }
    })
// res.send('NOT IMPLEMENTED: donation create GET');
};

// Display donation create form on GET.
exports.donator_create_get = function(req, res, next) {
    Person.findById(req.params.id)
        //.populate('guest')
        .exec(function(err, results){
            if (err) {return next(err)};
            if (results==null){
                var err = new Error('Guest not found');
                err.status = 404;
                return next(err);
            };
            res.render('donation_create', {
                title: 'Start new donation',
                guests: results
            })
        })
// res.send('NOT IMPLEMENTED: donation create GET');
};

// Handle donation create on POST.
exports.donation_create_post = [
    //Validation
    body('guest').isLength({min: 1}).trim().withMessage('Missing Guest'),   
    body('donationType').isLength({min: 1}).trim().withMessage('Missing Donation Type'),
    body('donationDate').isLength({min: 1}).trim().withMessage('Missing Donation Date'),
    body('donationAmount').isLength({min: 1}).trim().withMessage('Missing Donation Amount'),
    sanitizeBody('*').trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('donation_create', {
                title: 'New Donation',
                errors: errors.array()
            });
            return;
        }
        else {
            var donation = new Donation({
                guest: req.body.guest,
                donationType: req.body.donationType,
                donationDate: req.body.donationDate,
                donationAmount: req.body.donationAmount,
                AdoptionDate: req.body.AdoptionDate,
                AdoptionMessage: req.body.AdoptionMessage                
            });               
            donation.save(function(err,results) {
                console.log(results);
                if (err) {return next(err)};
                res.redirect(donation.url);
            });
        }
    }
// res.send('NOT IMPLEMENTED: donation create POST');
];

// Display donation delete form on GET.
exports.donation_delete_get = function(req, res, next) {
    Donation.findById(req.params.id)
    //.populate('guest')
    .exec(function(err,results) {
        if (err) {return next(err)};       
        if (results==null) {res.redirect('/donation')};
        res.render('donation_delete', { title: 'Delete Donation', donation: results });
    });
// res.send('NOT IMPLEMENTED: donation delete GET');
};

// Handle donation delete on POST.
exports.donation_delete_post = function(req, res, next) {
    Donation.findByIdAndDelete(req.params.id, 
        function deleteDonation(err) {
        if (err) return next(err);
        //redirect will need updated url address--------------
        res.redirect('/users/donation');
    });
// res.send('NOT IMPLEMENTED: donation delete POST');
};

// Display donation update form on GET.
exports.donation_update_get = function(req, res) {

    async.parallel({
        donation: function(callback) {
            Donation.findById(req.params.id)
            .populate('guest')
            .exec(callback);
        },  
        guest: function(callback) {
            Person.find(callback);
        },      
    }),
    function (err,res, results) {
        if (err) {return next(err); }
        if (results.donation==null) {
            var err = new Error('Donation not found');
            err.status = 404;
            return next(err);
        }
        res.render('donation_update', { title: 'Update Donation', donation: results.donation, guests: results.guest})
    };    
// res.send('NOT IMPLEMENTED: donation update GET');
};

// Handle donation update on POST.
exports.donation_update_post = [
    //Validation
    body('guest').isLength({min: 1}).trim().withMessage('Missing guest'),   
    body('donationType').isLength({min: 1}).trim().withMessage('Missing Donation Type'),
    body('donationDate').isLength({min: 1}).trim().withMessage('Missing Donation Date'),
    body('donationAmount').isLength({min: 1}).trim().withMessage('Missing Donation Amount'),
    body('AdoptionDate').isLength({min: 1}).trim().withMessage('Missing Adoption Date'),
    body('AdoptionMessage').isLength({min: 1}).trim().withMessage('Missing Adoption Message'),
    
    sanitizeBody('*').trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('donation_update', {
                title: 'Update Donation Failed',
                _id: donation._id,
                donation: donation,
                errors: errors.array(),
            });
        return;
        }
        else {
            var donation = new Donation({
                guest: req.body.guest,
                donationType: req.body.donationType,
                donationDate: req.body.donationDate,
                donationAmount: req.body.donationAmount,
                AdoptionDate: req.body.AdoptionDate,
                AdoptionMessage: req.body.AdoptionMessage,  
                _id:req.params.id
            });
        };
    }
// res.send('NOT IMPLEMENTED: donation update POST');
];
