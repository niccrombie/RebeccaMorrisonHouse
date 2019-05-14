var mongoose = require('mongoose');
//var Person = require('../objects/Person');
var moment = require('moment');

var Schema = mongoose.Schema;

var RegistrationSchema = new Schema ({
    guest: {type: Schema.Types.ObjectId, ref: 'Person'},
    patient: {type: String, max:25},
    patientLoc: {type: String, max: 15},
    staff: {type: String, max:25},
    room: {type: Schema.Types.ObjectId, ref: 'Room'},
    checkIn: {type: Date, },
    checkOut: {type: Date, },
    vehicle: { type: String, max:15},
    plateNum: {type: String, max: 10},
    numbKeys: {type: String, max: 10},
    loans: {type: String, max: 100},
    comments: {type: String, max: 256}
});

RegistrationSchema
.virtual('url')
.get(function(){
    return '/users/registration/' + this._id;
});

RegistrationSchema
.virtual('name')
.get(function(){
    return this.guest.name;
});

RegistrationSchema
.virtual('checkedIn')
.get(function(){
    return moment(this.checkIn).format('ll')
});

RegistrationSchema
.virtual('checkedOut')
.get(function(){
    return moment(this.checkOut).format('ll')
});

module.exports = mongoose.model('Registration', RegistrationSchema);