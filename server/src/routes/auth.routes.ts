import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { authGuard } from "../middleware/auth.middleware";
import { User } from "../models/User.model";

const router = Router();
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "dev_access_secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev_refresh_secret";
const mobilePattern = /^[0-9]{10}$/;

const publicUser = (user: any) => ({
  id: user._id.toString(),
  role: user.role,
  name: user.name,
  mobile: user.mobile,
  email: user.email,
  isVerifiedIdentity: user.isVerifiedIdentity,
  demoKycComplete: user.demoKycComplete,
  createdAt: user.createdAt,
});

const generateTokens = (user: any) => {
  const payload = { id: user._id.toString(), role: user.role };
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as any });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "30d") as any });
  return { accessToken, refreshToken };
};

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;
    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanMobile = typeof mobile === "string" ? mobile.trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (cleanName.length < 2 || !mobilePattern.test(cleanMobile)) {
      return res.status(400).json({ message: "Enter your name and a 10-digit mobile number" });
    }
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }
    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Password is required (min 6 characters)" });
    }
    let user = await User.findOne({ mobile: cleanMobile });
    if (user) {
      return res.status(409).json({ message: "Mobile number already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({ role: "user", name: cleanName, mobile: cleanMobile, email: cleanEmail || undefined, passwordHash });
    await user.save();
    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();
    res.status(201).json({ accessToken, refreshToken, user: publicUser(user) });
  } catch (error: any) {
    if (error.code === 11000) return res.status(409).json({ message: "Mobile number already registered" });
    res.status(500).json({ message: error.message });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (typeof mobile !== "string" || !mobilePattern.test(mobile.trim()) || typeof password !== "string") {
      return res.status(400).json({ message: "Enter a 10-digit mobile number and password" });
    }
    const user = await User.findOne({ mobile: mobile.trim() });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: "Invalid mobile number or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid mobile number or password" });
    }

    // Existing buyer/owner accounts now share the User role.
    if (["buyer", "owner"].includes(user.role as string)) user.role = "user";

    const { accessToken, refreshToken } = generateTokens(user);

    // Hash refresh token before saving
    const salt = await bcrypt.genSalt(10);
    user.refreshTokenHash = await bcrypt.hash(refreshToken, salt);
    await user.save();

    res.json({
      accessToken,
      refreshToken,
      user: publicUser(user)
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /auth/kyc/demo — a UI prototype toggle, not identity verification.
router.post("/kyc/demo", authGuard, async (req: any, res) => {
  if (req.user.role !== "user") return res.status(403).json({ message: "User role required" });
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.demoKycComplete = true;
  await user.save();
  res.json({ demoKycComplete: true, demoOnly: true });
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

    res.json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: publicUser(user) });
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
    res.json(publicUser(user));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
