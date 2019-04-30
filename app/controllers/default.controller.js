
module.exports = {
    sendDefaultResponse: (req, res, next) => {
        res.status(200).json({
            message: "Welcome To the API"
        })
        next()
    }
}