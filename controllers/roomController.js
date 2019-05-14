var Room = require('../objects/Room');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all rooms.
exports.room_list = function(req, res, next) {
    Room.find()
    .sort([['roomNumber', 'ascending']])
    .exec(function(err, list_room) {
        if (err) {return next(err)};
        res.render('room_list', { title: 'All Room', room_list: list_room});
    }); 
    //res.send('NOT IMPLEMENTED: room list');
};

// Display detail page for a specific room.
exports.room_read = function(req, res, next) {
    Room.findById(req.params.id)
    .populate('room')
    .exec(function (err, results) {
        if (err) {return next(err)};
        if (results == null) {
            var err = new Error('Room not found');
            err.status = 404;
            return next(err)
        };
        console.log(results);
        res.render('room_read', {
            title: "Room Details",
            room: results
        })
        })       
   // res.send('NOT IMPLEMENTED: room detail: ' + req.params.id);
};


// Display room create form on GET.
exports.room_create_get = function(req, res) {
    res.render('room_create', {
        title: 'New Room'        
    });
};
    //res.send('NOT IMPLEMENTED: room create GET');

// Handle room create on POST.
exports.room_create_post = [
    body('roomNumber').trim().withMessage('Missing room Number'),
    body('handicapAccess').trim().withMessage('Is room handicap accessible?'),
    body('status').trim().withMessage('What is room status'),
    sanitizeBody('*').trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('room_create', {
                title: 'Unable to create new Room',
                errors: errors.array()
            });
            return;
        }
        else {
            var room = new Room({
                roomNumber: req.body.roomNumber,
                handicapAccess: req.body.handicapAccess,
                status: req.body.status
                
            });
            room.save(function(err, room) {
                console.log(room);
                if (err) {return next(err)};
                res.render('room_read', {
                    title: 'Room Details',
                    room: room
                })
                //res.redirect(Room.url);  //redirect ????
            });
        }
    }
    //res.send('NOT IMPLEMENTED: person create POST');
];
    


// Display room delete form on GET.
exports.room_delete_get = function(req, res) {
    Room.findById(req.params.id)
    .populate('room')
    .exec(function(err,results) {
        if (err) {return next(err)};
        if (results==null) {res.redirect('/room')};
        res.render('room_delete', {
            title: 'Delete Room',
            room: results
        });
    });
    //res.send('NOT IMPLEMENTED: person delete GET');
};
    


// Handle room delete on POST.
exports.room_delete_post = function(req, res, next) {
    Room.findByIdAndDelete(req.params.id, 
        function deleteRoom(err) {
        if (err) return next(err);
        //redirect will need updated url address--------------
        res.redirect('/users/room');
    });
    //res.send('NOT IMPLEMENTED: person delete POST');
};
    

// Display room update form on GET.
exports.room_update_get = function(req, res) {
    Room.findById(req.params.id)
        .populate('room')
        .exec(function (err, results){
            if (err) {return next(err)};
            res.render('room_update', {
                title: 'Update Room',
                room: results
        });
    //res.send('NOT IMPLEMENTED: person update GET');
});
};   

// Handle room update on POST.
exports.room_update_post = [
    body('roomNumber').trim().withMessage('Missing room Number'),
    body('handicapAccess').trim().withMessage('Is room handicap accessible?'),
    body('status').trim().withMessage('What is room status'),
    sanitizeBody('*').trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('room_update', {
                title: 'Room Error',
                //_id: room._id,
                room: room, 
                errors: errors.array()
            });
        return;
        }
        else {
            var room = new Room({
                roomNumber: req.body.roomNumber,
                handicapAccess: req.body.handicapAccess,
                status: req.body.status,
                _id:req.params.id
            });
            Room.findByIdAndUpdate(req.params.id, room, {}, function (err, room){
                if (err) {return next(err)}
                res.redirect(room.url);
            })
        };
    }
    //res.send('NOT IMPLEMENTED: room update POST');
];