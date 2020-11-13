const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')

const router = new express.Router()

/******************* TASK ***************************/
/****************************************************/
/******************* CREATE TASK ********************/

router.post('/tasks', auth, async (req, res) => {
    //const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save() 
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

/******************* END CREATE TASK *****************/
/******************* READ TASKS **********************/
// GET /tasks?completed
// GET /tastks&limit=10&skip=0
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    //req.query.completed
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true' //returns a string!
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            /*match: {
                completed: true
            }*/
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                /*: {
                    createdAt: -1 //1 for asc and -1 for desc
                }*/
                sort
            },
            
        }).execPopulate()
        //res.send(tasks)
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

/******************* END READ TASKS *****************/
/******************* READ TASK **********************/

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        //const task = await Task.findById(_id) 
        const task = await Task.findOne({ _id, owner: req.user._id})
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

/******************* END READ TASK *****************/
/******************* UPDATE TASK ********************/

router.patch('/tasks/:id', auth, async (req, res) => {
    //make sure only valid options are searched
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({
            error: 'Invalid updates!'
        })
    }

    try {
        //const task = await Task.findByIdAndUpdate(req.params.id)
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id
        })

        /*const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })*/

        if (!task) {
            return res.status(404).send(e)
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(404).send(e)
    }
})

/******************* END UPDATE TASK ****************/
/******************* DELETE USER ********************/

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        // const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        })
        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

/******************* DELETE TASK ********************/
/****************************************************/
/******************* END TASK ***********************/
/****************************************************/

module.exports = router