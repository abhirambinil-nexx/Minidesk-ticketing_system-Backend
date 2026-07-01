import googleService from "../services/google.service.js";

class GoogleController {
  async googleLogin(req, res) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ error: "idToken is required." });
      }

      const { user, tokens } =
        await googleService.authenticateWithGoogle(idToken);

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: "Google login successful",
        accessToken: tokens.accessToken,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
        },
      });
    } catch (error) {
      console.error("Google Auth Error:", error.message);

      if (error.message.includes("deactivated")) {
        return res.status(403).json({ error: error.message });
      }

      res
        .status(401)
        .json({ error: "Google authentication failed. Please try again." });
    }
  }
}

export default new GoogleController();
