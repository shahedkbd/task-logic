import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Simple hardcoded stripe payment endpoint to satisfy the "stripe checkout" piece
  // Since we don't have a real STRIPE_SECRET_KEY, we'll simulate.
  // Actually, we'll try to use a real stripe library if the key exists.
  let stripe: any = null;
  if (process.env.STRIPE_SECRET_KEY) {
    const { default: Stripe } = await import('stripe');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, coins } = req.body;
      
      if (!stripe) {
        // Fallback demo payment intent if no real API key provided
        return res.json({ 
          clientSecret: 'demo_secret_intent', 
          demoMode: true,
          amount,
          coins
        });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // in cents
        currency: "usd",
        metadata: { coins, amount },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
