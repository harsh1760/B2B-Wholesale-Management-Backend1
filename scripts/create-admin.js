const path = require("path");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const connectDb = require("../src/config/db");
const User = require("../src/models/User");

const createAdmin = async () => {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be configured");
    }

    if (adminPassword.length < 12) {
        throw new Error("ADMIN_PASSWORD must be at least 12 characters long");
    }

    await connectDb();

    const existingAdmin = await User.findOne({
        email: adminEmail,
        role: "admin"
    });

    if (existingAdmin) {
        existingAdmin.password = await bcrypt.hash(adminPassword, 10);
        await existingAdmin.save();
        console.log("Existing Admin detected. Password updated successfully.");
        return;
    }

    const existingUser = await User.findOne({ email: adminEmail })
        .select("name email role");

    if (existingUser) {
        throw new Error(
            "ADMIN_EMAIL belongs to an existing non-Admin user; no account was changed"
        );
    }

    const existingAdminCount = await User.countDocuments({ role: "admin" });

    if (existingAdminCount > 0) {
        throw new Error(
            "Admin account(s) already exist, but none match ADMIN_EMAIL; no new Admin was created"
        );
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await User.create({
        name: "Administrator",
        email: adminEmail,
        password: hashedPassword,
        role: "admin"
    });

    console.log("Admin created successfully.");
};

createAdmin()
    .catch((error) => {
        console.error(`Admin bootstrap failed: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });
