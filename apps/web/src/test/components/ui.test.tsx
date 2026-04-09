import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/shared/ui/Button";
import { Progress } from "@/shared/ui/Progress";

// ── Button ────────────────────────────────────────────────────────────────────

describe("Button", () => {
  it("affiche son contenu", () => {
    render(<Button>Cliquer</Button>);
    expect(screen.getByRole("button", { name: "Cliquer" })).toBeInTheDocument();
  });

  it("affiche '...' en mode loading", () => {
    render(<Button loading>Cliquer</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("...");
  });

  it("est désactivé quand disabled=true", () => {
    render(<Button disabled>Cliquer</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("est désactivé quand loading=true", () => {
    render(<Button loading>Cliquer</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("appelle onClick au clic", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Cliquer</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

// ── Progress ──────────────────────────────────────────────────────────────────

describe("Progress", () => {
  it("a le rôle progressbar", () => {
    render(<Progress value={50} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("expose aria-valuenow", () => {
    render(<Progress value={75} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "75");
  });

  it("clamp à 0 si valeur négative", () => {
    render(<Progress value={-10} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });

  it("clamp à 100 si valeur > 100", () => {
    render(<Progress value={150} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });
});
