const asyncHandler = (requestHandler) => async (req, res, err) => {
    try {
        await requestHandler(req, res, err)
    } catch (error) {
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}

export { asyncHandler }