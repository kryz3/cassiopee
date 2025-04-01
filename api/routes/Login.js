const router = require('../router');

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/api/loginUser", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "User does not exist" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Incorrect password" });
        }


        const token = registerSession(user);


        res.cookie("authToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Secure only in production
            sameSite: "Strict",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });


        res.json({
            success: true,
            message: "Login successful",
            token,
            id: user._id,
            role: user.role,
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});


router.post("/api/logout", (req, res) => {
    res.clearCookie("authToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
    });
    res.status(200).json({ message: "Logged out" });
});