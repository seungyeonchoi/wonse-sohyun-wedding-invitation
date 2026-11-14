import { Accounts } from "@/components/invitation/accounts";
import { BgmProvider } from "@/components/invitation/bgm";
import { Calendar } from "@/components/invitation/calendar";
import { Closing } from "@/components/invitation/closing";
import { Footer } from "@/components/invitation/footer";
import { Gallery } from "@/components/invitation/gallery";
import { Greeting } from "@/components/invitation/greeting";
import { Guestbook } from "@/components/invitation/guestbook";
import { HandLetter } from "@/components/invitation/hand-letter";
import { Hero } from "@/components/invitation/hero";
import { Location } from "@/components/invitation/location";
import { MiniAlbum } from "@/components/invitation/mini-album";
import { Share } from "@/components/invitation/share";
import { Snap } from "@/components/invitation/snap";
import { invitation } from "@/config/invitation";
import { brideName, groomName } from "@/lib/invitation";

export default function InvitationPage() {
  const { gallery, guestbook } = invitation;
  return (
    <BgmProvider
      src={invitation.bgm?.src}
      title={invitation.bgm?.title ?? invitation.hero.playerTitle}
      artist={invitation.bgm?.artist ?? `${groomName} ♥ ${brideName}`}
      artwork={invitation.hero.photo}
      autoplay={invitation.bgm?.autoplay}
    >
      <main className="invitation-column relative mx-auto min-h-dvh w-full max-w-[430px] overflow-x-clip bg-paper shadow-[0_0_40px_rgb(0_0_0/0.06)]">
        <Hero />
        <Greeting />
        <HandLetter />
        <MiniAlbum />
        <Calendar />
        <Gallery title={gallery.title} photos={gallery.photos} initialCount={gallery.initialCount} />
        <Location />
        <Accounts />
        <Snap />
        <Closing />
        {guestbook.enabled ? <Guestbook title={guestbook.title} previewCount={guestbook.previewCount} /> : null}
        <Share />
        <Footer />
      </main>
    </BgmProvider>
  );
}
