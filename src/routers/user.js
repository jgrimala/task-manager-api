const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const {
    sendWelcomeEmail,
    sendCancelEmail
} = require('../emails/account')
const router = new express.Router()


/****************** USER **************************/
/****************************************************/
/****************** CREATE USER *******************/

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()

        res.status(201).send({
            user,
            token
        })
    } catch (e) {
        res.status(400).send(e)
    }
})

/****************** END CREATE USER ****************/
/****************** LOGIN USER *********************/

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        res.send({
            user,
            token
        })
    } catch (e) {
        res.status(400).send()
    }
})

/****************** END LOGIN USER *****************/
/****************** LOGOUT USER *********************/

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

/****************** END LOGOUT USER *****************/
/****************** LOGOUTALL USER *********************/

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

/****************** END LOGOUTALL USER *****************/
/****************** READ USERS *********************/

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

/******************* END READ USERS *****************/
/******************* READ USER **********************/

/*router.get('/users/:id', async (req, res) => {
    const _id = req.params.id
    try {
        const user = await User.findById(_id)
        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})*/

/******************* END READ USER ******************/
/******************* UPDATE USER ********************/

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({
            error: 'Invalid updates!'
        })
    }

    try {
        // user = await User.findByIdAndUpdate(req.params.id)
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()

        res.send(req.user)
    } catch (e) {
        res.status(404).send(e)
    }
})

/******************* END UPDATE USER ****************/
/******************* DELETE USER ********************/

router.delete('/users/me', auth, async (req, res) => {
    try {
        /*const user = await User.findByIdAndDelete(req.user._id)
        if (!user) {
            return res.status(404).send()
        }*/
        await req.user.remove()
        sendCancelEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

/******************* DELETE USER ***************************/
//https://www.npmjs.com/package/sharp
//http://jsbin.com/
//https://regex101.com/
const upload = multer({
    //dest: 'avatars',
    limits: {
        fileSize: 1000000 //bites
    },
    fileFilter(req, file, callback) {
        //if (!file.originalname.endsWith('.jpg')) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return callback(new Error('File must be JPG or PNG'))
        }
        callback(undefined, true)
        // cb(new Error('File must be a ***'))
        // cb(undefined, true)
        // cb(undefined, false)
    }
})

/******************* UPLOAD AVATAR USER ********************/
// router.post('/users/me/avatar', upload.single('avatar'), (req, res) => {
// router.post('/users/me/avatar', errorMiddleware, (req, res) => {
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({
        width: 250,
        height: 250
    }).png().toBuffer()
    req.user.avatar = buffer

    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({
        error: error.message
    })
})
/******************* UPLOAD AVATAR USER ********************/
/******************* DELETE AVATAR USER ********************/
// router.post('/users/me/avatar', upload.single('avatar'), (req, res) => {
// router.post('/users/me/avatar', errorMiddleware, (req, res) => {
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})
/******************* DELETE AVATAR USER ********************/
/******************* GET AVATAR USER ********************/
// router.post('/users/me/avatar', upload.single('avatar'), (req, res) => {
// router.post('/users/me/avatar', errorMiddleware, (req, res) => {
router.get('/users/:id/avatar', async (req, res) => {
    /*req.user.avatar = undefined
    await req.user.save()
    res.send()*/
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})
/******************* GET AVATAR USER ********************/
/***********************************************************/
/******************* END USER ******************************/
/***********************************************************/

module.exports = router