app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existing = users.find((u) => u.email === email);
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    users.push({ email, passwordHash: hash });

    return res.status(201).json({ message: "User registered!" });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error during register" });
  }
});