const express = require("express");
const jwt = require("jsonwebtoken");
const StudentModel = require('../models/Student');
const StaffModel = require('../models/Staff');

// ---------------------------------------------------------------------------------------------------------------------------------------------

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret";

const createAccessToken = (payload) => {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

const createRefreshToken = (payload) => {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Login User for authentication

const loginUser = async (req, res) => {

    const { userId, userPassword } = req.body;

    const studentUser = await StudentModel.findOne({ registerNo: userId });
    const staffUser = await StaffModel.findOne({ staffId: userId });

    let user = studentUser || staffUser;
    if (!user) return res.status(404).json({ message: "User not found" });

    if (userPassword !== user.password)
        return res.status(400).json({ message: "Password does not match" });

    const role = studentUser ? 0 : user.role;
    const id = studentUser ? user.registerNo : user.staffId;

    const accessToken = createAccessToken({ id, role });
    const refreshToken = createRefreshToken({ id, role });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, secure: false,
        sameSite: "strict", path: "/auth/refresh"
    })

    res.status(200).json({
        status: 200, accessToken,
        user: { userId: id, role },
    })
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Refresh token for creating new access token

const tokenRefresh = (req, res) => {

    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    try {
        const payload = jwt.verify(token, REFRESH_TOKEN_SECRET);
        const accessToken = createAccessToken({ id: payload.id, role: payload.role });
        res.status(200).json({ accessToken, user: { userId: payload.id, role: payload.role } });

    } catch (err) {
        console.log(err);
        return res.status(403).json({ message: "Invalid refresh token" });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Logout User

const logoutUser = (req, res) => {
    res.clearCookie("refreshToken", { path: "/" });
    res.status(200).json({ message: "Logged out successfully" });
}

// -----------------------------------------------------------------------------------------------------------------

module.exports = { loginUser, tokenRefresh, logoutUser };