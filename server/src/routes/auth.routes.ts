import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { authGuard } from "../middleware/auth.middleware";
import { User } from "../models/User.model";

const router = Router();
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "dev_access_secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev_refresh_secret";

const generateTokens = (user: any) => {
  const payload = { id: user._id.toString(), role: user.role };
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as any });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "30d") as any });
  return { accessToken, refreshToken };
};

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { role, name, mobile, email, password } = req.body;

    if (!password || password.trim().length < 6) {
      return res.status(400).json({ message: "Password is required (min 6 characters)" });
    }

    let user = await User.findOne({ mobile });
    if (user) {
      return res.status(400).json({ message: "Mobile number already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({ role, name, mobile, email, passwordHash });
    await user.save();

    res.json({ message: "Registration successful. Please log in." });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;
    const user = await User.findOne({ mobile });

    if (!user || !user.passwordHash) {
      return res.status(404).json({ message: "User not found or invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Hash refresh token before saving
    const salt = await bcrypt.genSalt(10);
    user.refreshTokenHash = await bcrypt.hash(refreshToken, salt);
    await user.save();

    res.json({
      accessToken,
      refreshToken,
      user: { id: user._id, role: user.role, name: user.name, mobile: user.mobile, email: user.email }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /auth/demo-login (Fast Dev/Demo Switcher with real valid JWT)
router.post("/demo-login", async (req, res) => {
  try {
    const { role = "owner" } = req.body;
    const mobileMap: Record<string, string> = {
      owner: "9999999991",
      buyer: "9999999992",
      advisor: "9999999993",
      admin: "9999999994",
    };
    const demoMobile = mobileMap[role] || "9999999991";
    let user = await User.findOne({ mobile: demoMobile });
    if (!user) {
      user = new User({
        role,
        name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        mobile: demoMobile,
        email: `demo.${role}@malikse.in`,
        isVerifiedIdentity: true,
      });
      await user.save();
    }
    const tokens = generateTokens(user);
    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { id: user._id, role: user.role, name: user.name, mobile: user.mobile, email: user.email }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /auth/refresh
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token is required" });
    }

    // Verify token signature
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as { id: string; role: string };
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Verify token hash
    const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Refresh token mismatch or expired" });
    }

    // Issue new tokens (rotation)
    const tokens = generateTokens(user);
    
    // Save new hash
    const salt = await bcrypt.genSalt(10);
    user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, salt);
    await user.save();

    res.json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
  } catch (error: any) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

// POST /auth/logout
router.post("/logout", authGuard, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshTokenHash = undefined;
      await user.save();
    }
    res.json({ message: "Logged out successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /auth/me
router.get("/me", authGuard, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash -refreshTokenHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
