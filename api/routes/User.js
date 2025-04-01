const router = require('../router');
const User = require('../../models/User');

const bcrypt = require("bcrypt");
const LRU = require("lru-cache");

const lru = new LRU({ttl: 5 });

router.get("/api/getUsers", async (req, res) => {
    try {
        const Users = await User.find();
        res.json(Users);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch Users" });
    }
});

router.post("/api/getAvatar", async (req, res) => {
    try {
        const { id } = req.body;
        const user = await User.findOne({"_id": id});
        if (!user) {
            return res.status(404).json({error: "User not found"});
        }
        res.json({avatar: user.avatar});
    } catch (error) {
        res.status(500).json({error: "Failed to fetch avatar"});
    }
});

router.post("/api/changeUsername", async (req, res) => {
    try {
        const { id , username } = req.body;
        const user = await User.findOne({"_id": id});
        if (!user) {
            return res.status(404).json({error: "User not found"});
        }
        user.username = username
        await user.save(); // Save the changes
    } catch (error) {
        res.status(500).json({error: "Failed to fetch user to change name"});
    }
});

router.post("/api/setAvatar", async (req, res) => {
    try {
        const { id, avatar } = req.body;
        const user = await User.findOne({"_id": id})
        if (!user) {
            return res.status(404).json({error: "User not found"})
        }
        user.avatar = avatar
        await user.save(); // Save the changes

        res.json({sucess: true,message: "Avatar was successfully set"})
    } catch (error) { res.status(500).json({error: "Error while setting avatar"})}
})

router.post("/api/addUser", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if(!username || !email || !password) throw new Error("User already exists");

        const existingUser = await User.findOne({ email: email });
        const existingUser2 = await User.findOne({ username: username });
        if (existingUser || existingUser2 ) {
            return res.status(400).json({error: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username: username,
            email: email,
            password: hashedPassword,
        });

        await newUser.save();
        res
            .status(201)
            .json({ message: "User created successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ error: "Failed to add user", stacktrace: error.message });
    }
});

router.post("/api/deleteUser", async (req, res) => {
    try {
        const { id } = req.body;

        if(id === undefined) throw new Error("User not found");

        const user = await User.findByIdAndDelete({"_id": id});
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ message: "User deleted successfully", user });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete User" });
    }
});

router.post("/api/getUser", async (req, res) => {
    try {
        const { id } = req.body;

        let user = undefined;
        if(lru.get(id)) user = lru.get(id);
        else {
            let user = await User.findOne({"_id": id});
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            lru.set(id, user);
        }

        res.json({ message: "User successfully retrieved", user });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch User" });
    }
});