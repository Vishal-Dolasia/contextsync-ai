import dotenv from "dotenv";

dotenv.config();

const agentMiddleware = (req, res, next) => {
    const secret = req.headers["x-agent-secret"];

    if (!secret) {
        return res.status(401).json({
            message: "Agent secret missing"
        });
    }

    if (secret !== process.env.AGENT_INTERNAL_SECRET) {
        return res.status(401).json({
            message: "Invalid agent secret"
        });
    }

    next();
};

export default agentMiddleware;