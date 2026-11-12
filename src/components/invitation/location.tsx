import { Bus, Car, CircleParking, Copy, Info, TramFront, type LucideIcon } from "lucide-react";

import { invitation, type TransportItem } from "@/config/invitation";

import { CopyButton } from "./copy-button";
import { NavLinks } from "./nav-links";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import { VenueMap } from "./venue-map";

const ICONS: Record<TransportItem["kind"], LucideIcon> = {
  parking: CircleParking,
  subway: TramFront,
  bus: Bus,
  car: Car,
  etc: Info,
};

export function Location() {
  const { location } = invitation;
  return (
    <Reveal aria-label="오시는 길" className="flex flex-col items-center px-4 py-12">
      <SectionHeading label="LOCATION" title="식장 위치" className="mb-1" />

      <address className="text-center text-[15px] leading-[27px] text-ink-soft not-italic">
        <p>{location.venue}</p>
        <p>{location.hall}</p>
        <p className="inline-flex items-center gap-1">
          {location.address}
          <CopyButton text={location.address} message="주소가 복사되었습니다." aria-label="주소 복사" className="relative grid size-4 place-items-center before:absolute before:-inset-3">
            <Copy className="size-3.5" />
          </CopyButton>
        </p>
      </address>

      <div className="mt-3 w-full border border-line-strong">
        <VenueMap lat={location.lat} lng={location.lng} name={location.venue} />
        <NavLinks name={location.venue} lat={location.lat} lng={location.lng} naverMapUrl={location.naverMapUrl} />
      </div>

      <ul className="w-full">
        {location.transport.map((item) => {
          const Icon = ICONS[item.kind];
          return (
            <li key={item.title} className="flex flex-col gap-1 border-b border-line py-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] leading-[27px] font-bold">{item.title}</h3>
                <span className="grid size-7 place-items-center rounded-[8px] bg-chip">
                  <Icon className="size-4" strokeWidth={1.8} aria-hidden />
                </span>
              </div>
              <p className="text-[15px] leading-[27px] whitespace-pre-line">{item.description}</p>
            </li>
          );
        })}
      </ul>
    </Reveal>
  );
}
