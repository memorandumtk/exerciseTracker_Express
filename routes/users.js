
const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser')
const User = require("../models/user");
const Exercise = require("../models/exercise");
const { body, validationResult } = require("express-validator");
const exercise = require("../models/exercise");

router.use(bodyParser.urlencoded({ extended: false }))

const userCreate = async (req, res) => {
    const requestUser = req.body.username;
    const newUser = new User({
        name: requestUser
    });
    await newUser.save();
    res.json({ username: newUser.name, _id: newUser._id })
};

const userList = async (req, res, next) => {
    try {
        const allUsers = await User
            .find()
            .sort({ _id: 1 })
            .exec();
        console.log(allUsers) //just for test
        const usersList = allUsers.map(user => ({
            username: user.name,
            _id: user._id
        }));
        res.json(usersList);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send('Internal server error');
    }
}

const exerciseCreate = async (req, res, next) => {
    const requestExercise = req.body;
    console.log(requestExercise);
    // finding user from User usin request _id for finding user_id
    const linkedUser = await User.findOne({ _id: requestExercise._id });
    const newExercise = new Exercise({
        user: linkedUser._id,
        description: requestExercise.description,
        duration: requestExercise.duration,
        date: requestExercise.date
    })
    await newExercise.save()
    const newExerciseOutput = await Exercise
        .find({ user: newExercise.user })
        .findOne({ _id: newExercise._id })
        .populate('user')
        .exec()
    res.json({
        username: newExerciseOutput.user,
        description: newExerciseOutput.description,
        duration: newExerciseOutput.duration,
        date: newExerciseOutput.date_string,
        _id: newExerciseOutput._id,
    })
}

const exerciseLog = async (req, res) => {
    const requestId = req.params.id; // this request id is linked User collection
    try {
        const allLogs = await Exercise
            .find({ user: requestId })
            .sort({ _id: 1 })
            .populate('user')
            .exec();
        console.log(allLogs) //just for test
        const logsList = allLogs.map(log => ({
            username: log.user.name,
            count: allLogs.length,
            _id: log.user._id,
            log: [{
                description: log.description,
                duration: log.duration,
                date: log.date_string
            }]
        }));
        res.json(logsList);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send('Internal server error');
    }
}

router.post("/", userCreate)

router.get("/", userList)

router.post("/:id/exercises", exerciseCreate)

router.get("/:id/logs", exerciseLog)
module.exports = router;