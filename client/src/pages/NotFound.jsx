import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="py-24">
      <Container className="text-center">
        <div className="text-[8rem] leading-none font-extrabold text-gradient-brand">
          404
        </div>
        <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight">
          We can't find that page
        </h1>
        <p className="mt-3 text-ink-500 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6 flex justify-center">
          <Button as={Link} to="/" size="lg">
            <ArrowLeft className="w-4 h-4" /> Back home
          </Button>
        </div>
      </Container>
    </main>
  );
}
