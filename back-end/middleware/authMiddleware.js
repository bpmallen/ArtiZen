import JWT from "jsonwebtoken";

export const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorised, no token" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = JWT.verify(token, secret);

    req.userId = decoded.id;

    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(401).json({ message: "Not authorised, token failed." });
  }
};
