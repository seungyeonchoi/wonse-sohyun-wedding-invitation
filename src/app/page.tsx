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
import { PageEffects } from "@/components/invitation/page-effects";
import { Share } from "@/components/invitation/share";
import { invitation } from "@/config/invitation";
import { brideName, groomName } from "@/lib/invitation";
import { describeWeddingDate } from "@/lib/wedding-date";

export default function InvitationPage() {
  const { gallery, guestbook } = invitation;
  const date = describeWeddingDate(invitation.date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <BgmProvider
      src={invitation.bgm?.src}
      title={invitation.bgm?.title ?? invitation.hero.playerTitle}
      artist={invitation.bgm?.artist ?? `${groomName} ♥ ${brideName}`}
      album={`${groomName} ♥ ${brideName} · ${date.year}.${pad(date.month)}.${pad(date.day)}`}
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
        <Closing />
        {guestbook.enabled ? (
          <Guestbook
            title={guestbook.title}
            previewCount={guestbook.previewCount}
            capsuleOpensAt={guestbook.timeCapsule.enabled ? guestbook.timeCapsule.opensAt : undefined}
          />
        ) : null}
        <Share />
        <Footer />
      </main>
      <PageEffects />
    </BgmProvider>
  );
}
