import { profile } from "../../config/profile";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { replayDeployMotion } from "../../lib/redeploy";

/**
 * The gold-foil packet: a confident middle-ground envelope tucked in the
 * top-left corner, reading CHRIS KMELIER. Pulling it redeploys the sheet —
 * the label is a real control, not a promise: it scrolls to the top and
 * replays the sheet's deploy motion.
 */
export function Packet() {
  const reduced = useReducedMotion();

  const onPull = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    replayDeployMotion();
  };

  return (
    <a
      href="#home"
      onClick={onPull}
      aria-label={`${profile.name}, pull to redeploy the sheet`}
      className="packet-foil anim-rise d-1 inline-block -rotate-[5deg] rounded-[2px] px-5 py-3.5 transition-transform duration-300 hover:-rotate-[2deg] hover:scale-[1.03]"
    >
      <span className="block font-mono text-[13px] font-bold tracking-[0.22em] text-ink">
        CHRIS KMELIER
      </span>
      <span
        aria-hidden="true"
        className="mt-1 block border-t border-ink/25 pt-1 font-mono text-[9px] tracking-[0.3em] text-ink/70"
      >
        PULL TO DEPLOY
      </span>
    </a>
  );
}
