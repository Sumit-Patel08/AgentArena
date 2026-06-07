import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { AnnouncementBar } from "./AnnouncementBar";

export function SiteLayout({
  children,
  showAnnouncement = false,
}: {
  children: ReactNode;
  showAnnouncement?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {showAnnouncement && <AnnouncementBar />}
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
