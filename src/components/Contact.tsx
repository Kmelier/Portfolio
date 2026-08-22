import { Mail } from "lucide-react";
import { profile } from "../config/profile";
import { Section, SectionHeading } from "./Section";
import { DiscordIcon, GithubIcon, LinkedinIcon } from "./icons";

export function Contact() {
  const links = [
    profile.email && {
      label: "Email",
      href: `mailto:${profile.email}`,
      icon: <Mail className="h-4 w-4" />,
      external: false,
    },
    profile.social.github && {
      label: "GitHub",
      href: profile.social.github,
      icon: <GithubIcon className="h-4 w-4" />,
      external: true,
    },
    profile.social.linkedin && {
      label: "LinkedIn",
      href: profile.social.linkedin,
      icon: <LinkedinIcon className="h-4 w-4" />,
      external: true,
    },
    profile.social.discord && {
      label: "Discord",
      href: profile.social.discord,
      icon: <DiscordIcon className="h-4 w-4" />,
      external: true,
    },
  ].filter(Boolean) as {
    label: string;
    href: string;
    icon: React.ReactNode;
    external: boolean;
  }[];

  return (
    <Section id="contact">
      <SectionHeading
        kicker="Contact"
        title="Let's build something."
        sub="My inbox is open — project ideas, questions, or something random worth building."
      />
      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            {...(link.external
              ? { target: "_blank", rel: "noreferrer noopener" }
              : {})}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-surface/70 px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent/50 sm:w-auto"
          >
            {link.icon}
            {link.label}
          </a>
        ))}
      </div>
    </Section>
  );
}
