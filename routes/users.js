
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
    console.log(requestUser)
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
    const linkedUser = await User.findOne({ _id: req.params.id });
    console.log(linkedUser._id)
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
        username: newExerciseOutput.user.name,
        description: newExerciseOutput.description,
        duration: newExerciseOutput.duration,
        date: newExerciseOutput.date_string,
        _id: newExerciseOutput.user._id,
    })
}

const exerciseLog = async (req, res) => {
    const fromQuery = req.query.from;
    const toQuery = req.query.to;
    const limitQuery = req.query.limit;
    const requestId = req.params.id; // this request id is linked User collection
    try {
        const allLogs = await Exercise
            .find({ user: requestId })
            .find({
                date: {
                    $gte: fromQuery ? fromQuery : new Date(0).toISOString(),
                    $lte: toQuery ? toQuery : new Date().toISOString()
                }
            })
            .sort({ _id: 1 })
            .limit(
                limitQuery ? limitQuery : ''
            )
            .populate('user')
            .exec();
        const arrayOfExercise = await Exercise
            .find({ user: requestId })
            .distinct('description')
            .exec();
        console.log(arrayOfExercise) // for test
        console.log("This is allLogs.") //just for test
        console.log(allLogs) //just for test
        const logsList = allLogs.map(log => ({
            description: log.description,
            duration: log.duration,
            date: log.date_string
        }));
        res.json({
            username: allLogs[0].user.name,
            count: arrayOfExercise.length,
            _id: allLogs[0].user._id,
            log: logsList
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send('Internal server error');
    }
}

router.post("/", userCreate)

router.get("/", userList)

router.post("/:id/exercises", exerciseCreate)

router.get("/:id/logs", exerciseLog)

const collectionsDelete = async (req, res) => {
    try {
        await Exercise.deleteMany({});
        console.log("Exercise collection is deleted.")
        await User.deleteMany({});
        console.log("User collection is deleted.")
        res.send("both of collection Exercise and User were deleted.")
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send('Internal server error');
    }
}
router.post("/delete", collectionsDelete)

module.exports = router;