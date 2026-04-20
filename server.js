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

app.get("/weather", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({ error: "Missing token" });
  }

  const token = auth.split(" ")[1];

  try {
    jwt.verify(token, JWT_SECRET);
  } catch (_err) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const city = req.query.city;
  if (!city) {
    return res.status(400).json({ error: "City required" });
  }

  try {
    const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
    const weatherResponse = await fetch(url);

    if (!weatherResponse.ok) {
      return res.status(500).json({ error: "Error from weather API" });
    }

    const data = await weatherResponse.json();
    const current = data.current_condition?.[0] || {};

    return res.json({
      city,
      temp: current.temp_C || current.temp_F || null,
      description: current.weatherDesc?.[0]?.value || null,
      wind: current.windspeedKmph || current.windspeedMiles || null,
      raw: data,
    });
  } catch (err) {
    console.error("Weather fetch error:", err);
    return res.status(500).json({ error: "Server error during weather fetch" });
  }
});