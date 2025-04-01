const router = require('../router');

router.post("/api/setAdmin", async (req, res) => {
    try {
        const tokenCookie = req.cookies.get("token");
        const session = getSession(tokenCookie);

        if(session.isAdmin === true) {
            const { id } = req.body;
            const user = await User.findOne({"_id": id})
            if (!user) {
                return res.status(404).json({error: "User not found"})
            }
            user.role = "admin"
            await user.save(); // Save the changes

            res.json({sucess: true,message: "User promoted to admin"})
        }
    } catch (error) { res.status(500).json({error: "Error while setting Admin"})}
})

router.post("/api/verifyRoleAdmin", async (req,res) => {
    try {
        const tokenCookie = req.cookies.get("token");

        const session = getSession(tokenCookie);

        if (!session) {
            return res.status(404).json({error: "User not found"});
        }
        if (session.role != "admin") {
            return res.status(401).json({error: "User not admin"});
        }
        res.json({message: "User is admin", success: true});
    } catch (error) {
        res.status(500).json({error: "Failed to verify role"});
    }
})
